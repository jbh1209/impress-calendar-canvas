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
    const supabaseAnon = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    const { data: userData } = await supabaseAnon.auth.getUser(token);
    const user = userData.user;
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 });
    }

    const { order_id } = await req.json();
    if (!order_id) {
      return new Response(JSON.stringify({ error: 'Missing order_id' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
    }

    // Use service role to fetch order and validate ownership
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single();

    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 });
    }

    if (order.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 });
    }

    const merchantId = Deno.env.get('PAYFAST_MERCHANT_ID') ?? '';
    const merchantKey = Deno.env.get('PAYFAST_MERCHANT_KEY') ?? '';
    const passphrase = Deno.env.get('PAYFAST_PASSPHRASE') ?? '';
    const mode = (Deno.env.get('PAYFAST_MODE') ?? 'sandbox').toLowerCase();

    if (!merchantId || !merchantKey) {
      return new Response(JSON.stringify({ error: 'PayFast not configured' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
    }

    const processUrl = mode === 'live'
      ? 'https://www.payfast.co.za/eng/process'
      : 'https://sandbox.payfast.co.za/eng/process';

    const origin = req.headers.get('origin') ?? 'https://example.com';
    const return_url = `${origin}/payment-success?order_id=${order_id}`;
    const cancel_url = `${origin}/payment-canceled?order_id=${order_id}`;
    const notify_url = `${Deno.env.get('SUPABASE_URL')}/functions/v1/payfast-itn`;

    const amount = Number(order.total_amount || 0).toFixed(2);

    const params: Record<string, string> = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url,
      cancel_url,
      notify_url,
      m_payment_id: String(order_id),
      amount,
      item_name: `Order #${String(order_id).slice(0, 8)}`,
      email_address: user.email || '',
      custom_str1: String(order_id),
      currency: 'ZAR',
    };

    const signature = buildSignature(params, passphrase);

    return new Response(
      JSON.stringify({ process_url: processUrl, params: { ...params, signature } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('payfast-initiate error', error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
});
