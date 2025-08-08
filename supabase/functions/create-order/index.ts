import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const { shipping_address_id } = await req.json().catch(() => ({ shipping_address_id: null }));

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch active cart
    const { data: cart } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (!cart) {
      return new Response(JSON.stringify({ error: 'No active cart' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
    }

    const { data: items } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cart.id);

    if (!items || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Cart is empty' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
    }

    const total = items.reduce((sum: number, it: any) => sum + Number(it.total_price || 0), 0);

    // Create order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert([{
        user_id: user.id,
        template_id: null,
        total_amount: total,
        status: 'pending',
        customization_data: null,
        shipping_address_id: shipping_address_id || null
      }])
      .select()
      .single();

    if (orderErr || !order) {
      throw orderErr;
    }

    // Create order items
    const orderItemsPayload = items.map((ci: any) => ({
      order_id: order.id,
      product_id: ci.product_id,
      quantity: ci.quantity,
      unit_price: ci.unit_price,
      total_price: ci.total_price
    }));

    await supabase.from('order_items').insert(orderItemsPayload);

    // Record payment transaction placeholder
    await supabase
      .from('payment_transactions')
      .insert([{ order_id: order.id, amount: total, currency: 'ZAR', provider: 'payfast', status: 'pending' }]);

    // Mark cart as checked out
    await supabase
      .from('carts')
      .update({ status: 'checked_out' })
      .eq('id', cart.id);

    return new Response(
      JSON.stringify({ order_id: order.id, amount: total }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('create-order error', error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
});
