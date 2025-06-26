
import { supabase } from "@/integrations/supabase/client";

export interface ImageLoadResult {
  success: boolean;
  imageElement?: HTMLImageElement;
  error?: string;
}

export const loadSupabaseImage = async (url: string): Promise<ImageLoadResult> => {
  console.log("[imageLoader] Starting Supabase image load:", url);
  
  try {
    // First approach: Try direct loading with crossOrigin
    const directResult = await loadImageDirect(url);
    if (directResult.success) {
      console.log("[imageLoader] Direct loading successful");
      return directResult;
    }
    
    // Second approach: Try with signed URL if it's a storage URL
    if (url.includes('supabase') && url.includes('storage')) {
      console.log("[imageLoader] Trying signed URL approach...");
      const signedResult = await loadWithSignedUrl(url);
      if (signedResult.success) {
        console.log("[imageLoader] Signed URL loading successful");
        return signedResult;
      }
    }
    
    // Third approach: Try blob URL
    console.log("[imageLoader] Trying blob URL approach...");
    const blobResult = await loadWithBlobUrl(url);
    if (blobResult.success) {
      console.log("[imageLoader] Blob URL loading successful");
      return blobResult;
    }
    
    return {
      success: false,
      error: "All loading methods failed"
    };
    
  } catch (error) {
    console.error("[imageLoader] Complete failure:", error);
    return {
      success: false,
      error: `Loading failed: ${error.message}`
    };
  }
};

const loadImageDirect = (url: string): Promise<ImageLoadResult> => {
  return new Promise((resolve) => {
    const img = new Image();
    
    const timeout = setTimeout(() => {
      resolve({ success: false, error: "Direct loading timeout" });
    }, 8000);
    
    img.onload = () => {
      clearTimeout(timeout);
      console.log("[imageLoader] Direct load success:", {
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      });
      resolve({ success: true, imageElement: img });
    };
    
    img.onerror = (error) => {
      clearTimeout(timeout);
      console.warn("[imageLoader] Direct load failed:", error);
      resolve({ success: false, error: "Direct loading failed" });
    };
    
    img.crossOrigin = 'anonymous';
    img.src = url;
  });
};

const loadWithSignedUrl = async (url: string): Promise<ImageLoadResult> => {
  try {
    // Extract the path from the storage URL
    const urlParts = url.split('/storage/v1/object/public/pdf-previews/');
    if (urlParts.length !== 2) {
      return { success: false, error: "Invalid storage URL format" };
    }
    
    const filePath = urlParts[1];
    console.log("[imageLoader] Extracted file path:", filePath);
    
    // Get a signed URL
    const { data: signedUrlData, error } = await supabase.storage
      .from('pdf-previews')
      .createSignedUrl(filePath, 300); // 5 minutes
    
    if (error || !signedUrlData?.signedUrl) {
      console.warn("[imageLoader] Signed URL creation failed:", error);
      return { success: false, error: "Could not create signed URL" };
    }
    
    console.log("[imageLoader] Created signed URL:", signedUrlData.signedUrl);
    return loadImageDirect(signedUrlData.signedUrl);
    
  } catch (error) {
    console.warn("[imageLoader] Signed URL approach failed:", error);
    return { success: false, error: `Signed URL failed: ${error.message}` };
  }
};

const loadWithBlobUrl = async (url: string): Promise<ImageLoadResult> => {
  try {
    console.log("[imageLoader] Fetching as blob...");
    
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache'
    });
    
    if (!response.ok) {
      return { success: false, error: `Fetch failed: ${response.status}` };
    }
    
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    console.log("[imageLoader] Created blob URL:", blobUrl);
    
    const result = await loadImageDirect(blobUrl);
    
    // Clean up blob URL after loading
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    
    return result;
    
  } catch (error) {
    console.warn("[imageLoader] Blob URL approach failed:", error);
    return { success: false, error: `Blob loading failed: ${error.message}` };
  }
};

export const testImageUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      mode: 'cors'
    });
    console.log("[imageLoader] URL test result:", {
      status: response.status,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });
    return response.ok;
  } catch (error) {
    console.warn("[imageLoader] URL test failed:", error);
    return false;
  }
};
