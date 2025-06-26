
import { useEffect, useRef } from "react";
import { Canvas as FabricCanvas } from "fabric";
import { toast } from "sonner";
import { renderZones, loadTemplateBackground } from "./utils/zoneUtils";
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
          console.log("[Canvas] Attempting to load preview image...");
          
          try {
            await loadTemplateBackground(
              canvas, 
              activePage.preview_image_url,
              {
                width: canvasWidth,
                height: canvasHeight
              }
            );
            console.log("[Canvas] Preview image loaded successfully");
          } catch (error) {
            console.error("[Canvas] Preview image loading failed:", error);
            toast.error("Preview image could not be loaded - using fallback display");
          }
        } else {
          console.log("[Canvas] No preview image to load:", {
            isEditing,
            templateId: !!templateId,
            hasPreviewUrl: !!activePage?.preview_image_url
          });
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
      
      {/* Enhanced debug info */}
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

export default Canvas;
