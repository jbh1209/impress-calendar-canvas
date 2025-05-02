
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SHUTTERSTOCK_API_URL = "https://api.shutterstock.com/v2";

// Headers for CORS support
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function handleSearch(query: string, options: any) {
  const searchParams = new URLSearchParams({
    query,
    per_page: options.perPage || "20",
    page: options.page || "1",
    ...options.filters
  });

  const response = await fetch(
    `${SHUTTERSTOCK_API_URL}/images/search?${searchParams.toString()}`,
    {
      headers: {
        'Authorization': `Bearer ${Deno.env.get("SHUTTERSTOCK_API_KEY")}`,
        'Content-Type': 'application/json'
      },
    }
  );

  return response.json();
}

async function handleLicense(imageId: string, licenseType: string) {
  const response = await fetch(
    `${SHUTTERSTOCK_API_URL}/images/licenses`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get("SHUTTERSTOCK_API_KEY")}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        images: [
          {
            id: imageId,
            format: "jpg",
            size: "huge"
          }
        ],
        subscription_id: Deno.env.get("SHUTTERSTOCK_SUBSCRIPTION_ID"),
        license: licenseType
      })
    }
  );

  return response.json();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    if (req.method === "POST") {
      const { action, ...params } = await req.json();

      switch (action) {
        case "search":
          const searchResults = await handleSearch(params.query, params.options || {});
          return new Response(JSON.stringify(searchResults), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });

        case "license":
          const licenseResult = await handleLicense(params.imageId, params.licenseType);
          return new Response(JSON.stringify(licenseResult), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
          
        default:
          return new Response(JSON.stringify({ error: "Invalid action" }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
      }
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
