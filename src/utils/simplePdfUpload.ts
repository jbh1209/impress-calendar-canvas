
import { supabase } from '@/integrations/supabase/client';

export interface UploadResult {
  success: boolean;
  message: string;
  pagesCreated?: number;
  pagesFailed?: number;
  error?: string;
}

export const uploadPdfAndCreatePages = async (
  file: File,
  templateId: string,
  onProgress?: (status: string) => void
): Promise<UploadResult> => {
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

    if (!data.success) {
      return {
        success: false,
        error: data.message,
        message: 'PDF processing failed'
      };
    }

    return {
      success: true,
      message: `Successfully processed ${data.pagesCreated} pages`,
      pagesCreated: data.pagesCreated,
      pagesFailed: data.pagesFailed
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
