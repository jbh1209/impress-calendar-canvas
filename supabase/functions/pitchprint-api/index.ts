import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PitchPrintRequest {
  action: 'validate_design' | 'get_design_preview' | 'generate_pdf' | 'fetch_design_categories' | 'fetch_designs';
  design_id?: string;
  project_id?: string;
  category_id?: string;
}

// Helper function to generate MD5 hash
async function generateMD5(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('MD5', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper function to create PitchPrint authentication signature
async function createPitchPrintSignature(apiKey: string, secretKey: string): Promise<{ timestamp: number; signature: string }> {
  const timestamp = Math.floor(Date.now() / 1000);
  const signatureString = apiKey + secretKey + timestamp;
  const signature = await generateMD5(signatureString);
  return { timestamp, signature };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, design_id, project_id, category_id }: PitchPrintRequest = await req.json();

    const apiKey = Deno.env.get('PITCHPRINT_API_KEY');
    const secretKey = Deno.env.get('PITCHPRINT_SECRET_KEY');

    if (!apiKey || !secretKey) {
      console.error('PitchPrint API credentials not found');
      return new Response(
        JSON.stringify({ error: 'PitchPrint API credentials not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`PitchPrint API request: ${action}`, { design_id, project_id });

    let response;

    switch (action) {
      case 'validate_design':
        if (!design_id) {
          return new Response(
            JSON.stringify({ error: 'Design ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Call PitchPrint API to validate design
        const validateResponse = await fetch(`https://api.pitchprint.io/v2/designs/${design_id}`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (validateResponse.ok) {
          const designData = await validateResponse.json();
          response = { valid: true, design: designData };
        } else {
          console.log(`Design validation failed for ${design_id}: ${validateResponse.status}`);
          response = { valid: false };
        }
        break;

      case 'get_design_preview':
        if (!design_id) {
          return new Response(
            JSON.stringify({ error: 'Design ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get design preview URL from PitchPrint
        const previewResponse = await fetch(`https://api.pitchprint.io/v2/designs/${design_id}/preview`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (previewResponse.ok) {
          const previewData = await previewResponse.json();
          response = { preview_url: previewData.url };
        } else {
          console.error(`Failed to get preview for design ${design_id}: ${previewResponse.status}`);
          response = { error: 'Failed to get design preview' };
        }
        break;

      case 'generate_pdf':
        if (!project_id) {
          return new Response(
            JSON.stringify({ error: 'Project ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Generate PDF from PitchPrint project
        const pdfResponse = await fetch(`https://api.pitchprint.io/v2/projects/${project_id}/pdf`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            format: 'pdf',
            quality: 'high'
          })
        });

        if (pdfResponse.ok) {
          const pdfData = await pdfResponse.json();
          response = { pdf_url: pdfData.url };
        } else {
          console.error(`Failed to generate PDF for project ${project_id}: ${pdfResponse.status}`);
          response = { error: 'Failed to generate PDF' };
        }
        break;

      case 'fetch_design_categories':
        try {
          // Generate authentication signature
          const { timestamp, signature } = await createPitchPrintSignature(apiKey, secretKey);
          
          // Fetch design categories from PitchPrint
          const categoriesResponse = await fetch('https://api.pitchprint.io/runtime/fetch-design-categories', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              apiKey,
              timestamp,
              signature
            })
          });

          console.log(`Categories API response status: ${categoriesResponse.status}`);
          
          if (categoriesResponse.ok) {
            const categoriesData = await categoriesResponse.json();
            console.log('Categories data:', categoriesData);
            response = { categories: categoriesData };
          } else {
            const errorText = await categoriesResponse.text();
            console.error(`Failed to fetch design categories: ${categoriesResponse.status} - ${errorText}`);
            response = { error: 'Failed to fetch design categories' };
          }
        } catch (error) {
          console.error('Error in fetch_design_categories:', error);
          response = { error: 'Failed to fetch design categories' };
        }
        break;

      case 'fetch_designs':
        try {
          // Generate authentication signature
          const { timestamp, signature } = await createPitchPrintSignature(apiKey, secretKey);
          
          // Prepare request body
          const requestBody: any = {
            apiKey,
            timestamp,
            signature
          };
          
          // Add category filter if provided
          if (category_id) {
            requestBody.categoryId = category_id;
          }
          
          // Fetch designs from PitchPrint
          const designsResponse = await fetch('https://api.pitchprint.io/runtime/fetch-designs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          });

          console.log(`Designs API response status: ${designsResponse.status}`);
          
          if (designsResponse.ok) {
            const designsData = await designsResponse.json();
            console.log('Designs data:', designsData);
            response = { designs: designsData };
          } else {
            const errorText = await designsResponse.text();
            console.error(`Failed to fetch designs: ${designsResponse.status} - ${errorText}`);
            response = { error: 'Failed to fetch designs' };
          }
        } catch (error) {
          console.error('Error in fetch_designs:', error);
          response = { error: 'Failed to fetch designs' };
        }
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log('PitchPrint API response:', response);

    return new Response(
      JSON.stringify(response),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('PitchPrint API error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});