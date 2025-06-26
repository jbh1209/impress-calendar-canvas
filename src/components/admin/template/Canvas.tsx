import { useEffect, useRef } from "react";
import { Canvas as FabricCanvas, Image as FabricImage } from "fabric";
import { toast } from "sonner";
import { loadSupabaseImage } from "./utils/imageLoader";
import { Template, TemplatePage } from "@/services/types/templateTypes";

interface CanvasProps {
  isEditing: boolean;
  templateId?: string;
  templateData?: Template | null;
  activePage?: TemplatePage;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  fabricCanvasRef: React.MutableRefObject<FabricCanvas | null>;
}

const Canvas = ({ 
  isEditing, 
  templateId, 
  templateData,
  activePage,
  isLoading,
  setIsLoading,
  fabricCanvasRef
}: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const initializeCanvas = async () => {
      try {
        if (!canvasRef.current) return;
        
        console.log("[Canvas] Starting canvas initialization:", {
          pageNumber: activePage?.page_number,
          previewUrl: activePage?.preview_image_url,
          pdfDimensions: {
            width: activePage?.pdf_page_width,
            height: activePage?.pdf_page_height
          },
          timestamp: new Date().toISOString()
        });
        
        // Dispose of existing canvas
        if (fabricCanvasRef.current) {
          console.log("[Canvas] Disposing existing canvas");
          fabricCanvasRef.current.dispose();
        }
        
        // Calculate canvas dimensions
        let canvasWidth = 800;
        let canvasHeight = 600;
        
        if (activePage?.pdf_page_width && activePage?.pdf_page_height) {
          const aspectRatio = activePage.pdf_page_width / activePage.pdf_page_height;
          const maxWidth = 1000;
          const maxHeight = 700;
          
          if (aspectRatio > 1) {
            canvasWidth = Math.min(maxWidth, activePage.pdf_page_width * 0.5);
            canvasHeight = canvasWidth / aspectRatio;
          } else {
            canvasHeight = Math.min(maxHeight, activePage.pdf_page_height * 0.5);
            canvasWidth = canvasHeight * aspectRatio;
          }
        }
        
        console.log("[Canvas] Calculated canvas dimensions:", { canvasWidth, canvasHeight });
        
        const canvas = new FabricCanvas(canvasRef.current, {
          width: canvasWidth,
          height: canvasHeight,
          backgroundColor: "#ffffff",
          selection: true,
          preserveObjectStacking: true,
        });
        
        fabricCanvasRef.current = canvas;
        console.log("[Canvas] Fabric canvas created successfully");
        
        // Load background if we have a preview URL
        if (isEditing && templateId && activePage?.preview_image_url) {
          console.log("[Canvas] Loading preview image with new loader...");
          
          try {
            const loadResult = await loadSupabaseImage(activePage.preview_image_url);
            
            if (loadResult.success && loadResult.imageElement) {
              console.log("[Canvas] Image loaded successfully, creating Fabric image...");
              
              const fabricImg = new FabricImage(loadResult.imageElement, {
                crossOrigin: 'anonymous',
              });
              
              // Scale and position the image
              const imgWidth = fabricImg.width || 1;
              const imgHeight = fabricImg.height || 1;
              const imgAspectRatio = imgWidth / imgHeight;
              const canvasAspectRatio = canvasWidth / canvasHeight;
              
              let scale: number;
              if (imgAspectRatio > canvasAspectRatio) {
                scale = canvasWidth / imgWidth;
              } else {
                scale = canvasHeight / imgHeight;
              }

              fabricImg.scale(scale);
              fabricImg.set({
                left: (canvasWidth - imgWidth * scale) / 2,
                top: (canvasHeight - imgHeight * scale) / 2,
                selectable: false,
                evented: false,
              });

              // Set as background and render
              canvas.backgroundImage = fabricImg;
              canvas.renderAll();
              
              console.log("[Canvas] Background image set successfully");
              toast.success("PDF preview loaded successfully");
              
            } else {
              console.error("[Canvas] Image loading failed:", loadResult.error);
              await createEnhancedFallback(canvas, { width: canvasWidth, height: canvasHeight });
              toast.error(`Preview loading failed: ${loadResult.error}`);
            }
            
          } catch (error) {
            console.error("[Canvas] Preview loading error:", error);
            await createEnhancedFallback(canvas, { width: canvasWidth, height: canvasHeight });
            toast.error(`Failed to load preview: ${error.message}`);
          }
        } else {
          console.log("[Canvas] No preview image to load");
          await createEnhancedFallback(canvas, { width: canvasWidth, height: canvasHeight });
        }
        
        setIsLoading(false);
        console.log("[Canvas] Canvas initialization complete");
        
      } catch (error) {
        console.error("[Canvas] Canvas initialization failed:", error);
        setIsLoading(false);
        toast.error(`Canvas initialization failed: ${error.message}`);
      }
    };
    
    if (activePage) {
      console.log("[Canvas] Active page changed, initializing canvas");
      initializeCanvas();
    }
    
    return () => {
      if (fabricCanvasRef.current) {
        console.log("[Canvas] Cleaning up canvas");
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [templateId, isEditing, templateData, activePage, setIsLoading, fabricCanvasRef]);
  
  return (
    <div className="relative">
      <div className="border-2 border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden">
        <canvas ref={canvasRef} className="max-w-full" />
      </div>
      
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg backdrop-blur-sm">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <div className="text-sm text-gray-600 font-medium">Loading Canvas...</div>
            {activePage && (
              <div className="text-xs text-gray-500 mt-1">
                Page {activePage.page_number}
              </div>
            )}
          </div>
        </div>
      )}
      
      {activePage && !isLoading && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-3 py-2 rounded-md">
          <div>Page {activePage.page_number}</div>
          <div className="text-xs opacity-75">
            {activePage.preview_image_url ? 
              `Preview: ${activePage.preview_image_url.split('/').pop()}` : 
              'No preview URL'
            }
          </div>
          {activePage.pdf_page_width && activePage.pdf_page_height && (
            <div className="text-xs opacity-75">
              {Math.round(activePage.pdf_page_width)}×{Math.round(activePage.pdf_page_height)}pt
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Enhanced fallback with better visual feedback
const createEnhancedFallback = async (
  canvas: FabricCanvas,
  pageData?: { width?: number; height?: number }
): Promise<void> => {
  const canvasWidth = pageData?.width || 800;
  const canvasHeight = pageData?.height || 600;
  
  console.log("[createEnhancedFallback] Creating fallback display");
  
  canvas.setWidth(canvasWidth);
  canvas.setHeight(canvasHeight);
  canvas.backgroundColor = '#f8f9fa';
  
  // Clear any existing objects
  canvas.clear();
  
  // Add simple grid pattern using lines
  const { Rect, Text: FabricText } = await import("fabric");
  
  // Add grid background
  const gridRect = new Rect({
    left: 0,
    top: 0,
    width: canvasWidth,
    height: canvasHeight,
    fill: 'transparent',
    stroke: '#e5e7eb',
    strokeWidth: 1,
    strokeDashArray: [5, 5],
    selectable: false,
    evented: false,
  });
  canvas.add(gridRect);
  
  // Add central message
  const mainText = new FabricText('PDF Preview', {
    left: canvasWidth / 2,
    top: canvasHeight / 2 - 30,
    fontSize: 24,
    fill: '#6b7280',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: 'bold',
    originX: 'center',
    originY: 'center',
    selectable: false,
    evented: false,
  });
  
  const subText = new FabricText('Could not load preview image', {
    left: canvasWidth / 2,
    top: canvasHeight / 2 + 10,
    fontSize: 14,
    fill: '#9ca3af',
    fontFamily: 'Inter, system-ui, sans-serif',
    originX: 'center',
    originY: 'center',
    selectable: false,
    evented: false,
  });
  
  const instructionText = new FabricText('You can still create customization zones', {
    left: canvasWidth / 2,
    top: canvasHeight / 2 + 40,
    fontSize: 12,
    fill: '#d1d5db',
    fontFamily: 'Inter, system-ui, sans-serif',
    originX: 'center',
    originY: 'center',
    selectable: false,
    evented: false,
  });
  
  canvas.add(mainText);
  canvas.add(subText);
  canvas.add(instructionText);
  
  canvas.renderAll();
};

export default Canvas;
