import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PitchPrintRequest {
  action: 'validate_design' | 'get_design_preview' | 'generate_pdf';
  design_id?: string;
  project_id?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, design_id, project_id }: PitchPrintRequest = await req.json();

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