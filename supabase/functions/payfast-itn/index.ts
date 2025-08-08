import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import md5 from "npm:blueimp-md5@2.19.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function buildSignature(params: Record<string, string>, passphrase?: string) {
  const entries = Object.entries(params)
    .filter(([k, v]) => k !== 'signature' && v !== undefined && v !== null && v !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
  if (passphrase) {
    entries.push(`${encodeURIComponent('passphrase')}=${encodeURIComponent(passphrase)}`);
  }
  const str = entries.join('&');
  return md5(str);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    let payload: Record<string, string> = {};

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const form = await req.formData();
      form.forEach((v, k) => {
        if (typeof v === 'string') payload[k] = v;
      });
    } else {
      const text = await req.text();
      const params = new URLSearchParams(text);
      params.forEach((v, k) => { payload[k] = v; });
    }

    // Verify signature
    const passphrase = Deno.env.get('PAYFAST_PASSPHRASE') ?? '';
    const receivedSig = payload['signature'];
    const computedSig = buildSignature(payload, passphrase);

    if (!receivedSig || receivedSig !== computedSig) {
      console.warn('Invalid PayFast signature');
      return new Response('Invalid signature', { status: 400, headers: corsHeaders });
    }

    const orderId = payload['m_payment_id'] || payload['custom_str1'];
    const paymentStatus = (payload['payment_status'] || '').toUpperCase();
    const amountGross = payload['amount_gross'] || payload['amount'] || '0';

    // Update DB
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (!orderId) {
      return new Response('Missing order reference', { status: 400, headers: corsHeaders });
    }

    // Upsert a payment transaction
    const { data: tx } = await supabase
      .from('payment_transactions')
      .insert([{
        order_id: orderId,
        amount: Number(amountGross || 0),
        currency: 'ZAR',
        provider: 'payfast',
        status: paymentStatus.toLowerCase() || 'pending',
        raw_payload: payload
      }])
      .select()
      .single();

    // Update order status
    let newStatus = 'pending';
    if (paymentStatus === 'COMPLETE') newStatus = 'paid';
    else if (paymentStatus === 'FAILED') newStatus = 'failed';
    else if (paymentStatus === 'CANCELLED') newStatus = 'cancelled';

    await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    return new Response('OK', { status: 200, headers: corsHeaders });
  } catch (error: any) {
    console.error('payfast-itn error', error);
    return new Response('Server error', { status: 500, headers: corsHeaders });
  }
});
