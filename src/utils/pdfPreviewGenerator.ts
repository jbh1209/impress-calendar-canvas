import { PDFRenderer } from './pdfRenderer';
import { supabase } from '@/integrations/supabase/client';

export interface PreviewGenerationOptions {
  scale?: number;
  quality?: number;
}

export class PDFPreviewGenerator {
  private pdfRenderer: PDFRenderer;

  constructor() {
    this.pdfRenderer = new PDFRenderer();
  }

  async generatePagePreviews(
    pdfUrl: string, 
    templateId: string,
    options: PreviewGenerationOptions = {}
  ): Promise<string[]> {
    const { scale = 0.5, quality = 0.8 } = options;
    const previewUrls: string[] = [];

    try {
      console.log('[PreviewGenerator] Starting preview generation for template:', templateId);
      
      // Load PDF
      const pdfDoc = await this.pdfRenderer.loadPDF(pdfUrl);
      const pageCount = this.pdfRenderer.getNumPages();

      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        try {
          // Create canvas for this page
          const canvas = document.createElement('canvas');
          
          // Render page to canvas
          await this.pdfRenderer.renderPageToCanvas(pageNum, canvas, { scale });

          // Convert to blob
          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => {
              resolve(blob!);
            }, 'image/jpeg', quality);
          });

          // Upload to storage
          const fileName = `${templateId}/page-${pageNum}-preview.jpg`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('pdf-previews')
            .upload(fileName, blob, {
              contentType: 'image/jpeg',
              upsert: true
            });

          if (uploadError) {
            console.error(`Error uploading preview for page ${pageNum}:`, uploadError);
            continue;
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('pdf-previews')
            .getPublicUrl(fileName);

          // Update template_pages with preview URL
          await supabase
            .from('template_pages')
            .update({ preview_image_url: urlData.publicUrl })
            .eq('template_id', templateId)
            .eq('page_number', pageNum);

          previewUrls.push(urlData.publicUrl);
          console.log(`[PreviewGenerator] Generated preview for page ${pageNum}`);

        } catch (pageError) {
          console.error(`Error generating preview for page ${pageNum}:`, pageError);
        }
      }

      console.log(`[PreviewGenerator] Generated ${previewUrls.length} previews for template ${templateId}`);
      return previewUrls;

    } catch (error) {
      console.error('[PreviewGenerator] Error generating previews:', error);
      throw error;
    } finally {
      this.pdfRenderer.destroy();
    }
  }

  async generateSinglePagePreview(
    pdfUrl: string,
    pageNumber: number,
    templateId: string,
    options: PreviewGenerationOptions = {}
  ): Promise<string | null> {
    const { scale = 0.5, quality = 0.8 } = options;

    try {
      // Load PDF
      await this.pdfRenderer.loadPDF(pdfUrl);
      
      // Create canvas
      const canvas = document.createElement('canvas');
      
      // Render page
      await this.pdfRenderer.renderPageToCanvas(pageNumber, canvas, { scale });

      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, 'image/jpeg', quality);
      });

      // Upload to storage
      const fileName = `${templateId}/page-${pageNumber}-preview.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pdf-previews')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) {
        console.error('Error uploading preview:', uploadError);
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('pdf-previews')
        .getPublicUrl(fileName);

      return urlData.publicUrl;

    } catch (error) {
      console.error('Error generating single page preview:', error);
      return null;
    } finally {
      this.pdfRenderer.destroy();
    }
  }
}