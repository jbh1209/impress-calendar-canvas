
/**
 * Edge Function for splitting a PDF into page images and creating template_pages.
 * Uses PDF-lib for splitting. Stub: simulates PDF split & image upload.
 */
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const BUCKET = "template-pages";

// SETUP supabase client using service role (for storage and db)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get PDF and template_id fields
    const formData = await req.formData();
    const file = formData.get("pdf") as File | null;
    const templateId = formData.get("template_id") as string | null;

    if (!file || !templateId) {
      return new Response(JSON.stringify({ error: "Missing file or template_id" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // TODO: In production - Parse PDF, export pages as images (here: stub with 3 fake images)
    // Example filenames: "templateId_p1.png", "templateId_p2.png", ...
    const pageCount = 3; // Demo: always 3 pages. Replace with actual PDF page count.
    const createdPages: any[] = [];

    for (let i = 1; i <= pageCount; i++) {
      // (In real version, use page image buffer here instead of empty Uint8Array)
      const fakePng = new Uint8Array([137,80,78,71,13,10,26,10]); // Just PNG header bytes, not a real image
      const filename = `${templateId}_page${i}.png`;
      const storagePath = `${templateId}/${filename}`;

      // Upload image to storage (replace fakePng with real image buffer)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, fakePng, {
          contentType: "image/png",
          upsert: true,
        });

      if (uploadError) {
        console.error(`Upload error on page ${i}:`, uploadError.message);
        return new Response(JSON.stringify({ error: "Error uploading to storage: " + uploadError.message }), {
          status: 500,
          headers: corsHeaders,
        });
      }

      // Generate public URL (uses storage helper function)
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
      const publicUrl = urlData?.publicUrl;

      // Insert into template_pages
      const insertPage = {
        template_id: templateId,
        page_number: i,
        preview_image_url: publicUrl,
      };

      const { data: pageData, error: pageError } = await supabase
        .from("template_pages")
        .insert([insertPage])
        .select()
        .single();

      if (pageError) {
        console.error(`Failed to insert template_page (page ${i}):`, pageError.message);
        return new Response(JSON.stringify({ error: "Error inserting template_pages: " + pageError.message }), {
          status: 500,
          headers: corsHeaders,
        });
      }
      createdPages.push(pageData);
    }

    console.log(`[split-pdf] Successfully processed PDF for template ${templateId}, fake page count: ${pageCount}`);

    return new Response(
      JSON.stringify({
        message: "PDF split and uploaded (demo/stub).",
        pages_created: createdPages.length,
        pages: createdPages,
      }),
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error("[split-pdf] Fatal error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});

