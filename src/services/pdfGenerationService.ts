
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PDFGenerationRequest {
  templateId: string;
  customizations: {
    pageId: string;
    zones: Array<{
      zoneId: string;
      type: 'image' | 'text';
      content: string; // URL for images, text content for text
      x: number;
      y: number;
      width: number;
      height: number;
    }>;
  }[];
  customerData: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export interface PDFGenerationResult {
  success: boolean;
  pdfUrl?: string;
  orderId?: string;
  error?: string;
}

/**
 * Generate a high-quality PDF with customer customizations
 */
export const generateCustomizedPDF = async (
  request: PDFGenerationRequest
): Promise<PDFGenerationResult> => {
  try {
    console.log("[PDF Generation] Starting PDF generation:", request);

    // Call the PDF generation edge function
    const { data, error } = await supabase.functions.invoke('generate-pdf', {
      body: request
    });

    if (error) {
      console.error("[PDF Generation] Error:", error);
      toast.error("Failed to generate PDF");
      return { success: false, error: error.message };
    }

    if (!data?.pdfUrl) {
      console.error("[PDF Generation] No PDF URL returned");
      toast.error("PDF generation completed but no download URL provided");
      return { success: false, error: "No PDF URL returned" };
    }

    console.log("[PDF Generation] Success:", data);
    toast.success("PDF generated successfully!");
    
    return {
      success: true,
      pdfUrl: data.pdfUrl,
      orderId: data.orderId
    };
  } catch (error) {
    console.error("[PDF Generation] Unexpected error:", error);
    toast.error("An unexpected error occurred during PDF generation");
    return { success: false, error: "Unexpected error occurred" };
  }
};

/**
 * Get PDF generation status
 */
export const getPDFGenerationStatus = async (orderId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('pdf-status', {
      body: { orderId }
    });

    if (error) {
      console.error("[PDF Status] Error:", error);
      return { status: 'error', error: error.message };
    }

    return data;
  } catch (error) {
    console.error("[PDF Status] Unexpected error:", error);
    return { status: 'error', error: "Failed to check status" };
  }
};
