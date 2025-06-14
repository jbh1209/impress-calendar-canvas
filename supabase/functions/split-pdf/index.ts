
/**
 * Edge Function for splitting a PDF into page images and creating template_pages.
 * This is a stub! Actual PDF splitting and storage code is TODO.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// Real code would use PDF-lib or PDF.js, then upload images to storage and insert in DB

serve(async (req) => {
  // Simple auth: you might want more here for prod use!
  const formData = await req.formData();
  const file = formData.get("pdf") as File | null;
  const templateId = formData.get("template_id") as string | null;

  if (!file || !templateId) {
    return new Response(JSON.stringify({ error: "Missing file or template_id" }), {
      status: 400
    });
  }

  // TODO: Implement PDF splitting, image generation, storage, insertion into template_pages.
  console.log("[stub] Received PDF for template:", templateId, "File name:", file.name);

  // For now, return success
  return new Response(JSON.stringify({ message: "Received PDF, splitting is TODO." }), {
    headers: { "Content-Type": "application/json" }
  });
});
