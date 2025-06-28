
import { supabase } from '@/integrations/supabase/client';

export interface PdfUploadResult {
  success: boolean;
  message: string;
  pagesCreated?: number;
  pagesFailed?: number;
  error?: string;
  pdfUrl?: string;
}

export const uploadPdfAndCreatePages = async (
  file: File,
  templateId: string,
  onProgress?: (status: string) => void
): Promise<PdfUploadResult> => {
  try {
    if (onProgress) onProgress('Uploading PDF...');
    
    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("template_id", templateId);

    const { data, error } = await supabase.functions.invoke('split-pdf', {
      body: formData,
    });

    if (error) {
      console.error("Upload error:", error);
      return {
        success: false,
        error: error.message,
        message: 'Upload failed'
      };
    }

    if (!data?.success) {
      return {
        success: false,
        error: data?.error || 'Unknown error',
        message: data?.message || 'PDF processing failed'
      };
    }

    return {
      success: true,
      message: data.message,
      pagesCreated: data.pagesCreated,
      pagesFailed: data.pagesFailed,
      pdfUrl: data.pdfUrl
    };

  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error.message,
      message: 'Unexpected error occurred'
    };
  }
};
