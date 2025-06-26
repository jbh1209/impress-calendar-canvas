
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
        
        console.log("[Canvas] Initializing canvas for page:", {
          pageNumber: activePage?.page_number,
          previewUrl: activePage?.preview_image_url,
          pdfDimensions: {
            width: activePage?.pdf_page_width,
            height: activePage?.pdf_page_height
          }
        });
        
        // Dispose of existing canvas
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.dispose();
        }
        
        // Calculate optimal canvas dimensions from PDF page data
        let canvasWidth = 800;
        let canvasHeight = 600;
        
        if (activePage?.pdf_page_width && activePage?.pdf_page_height) {
          const aspectRatio = activePage.pdf_page_width / activePage.pdf_page_height;
          const maxWidth = 1000;
          const maxHeight = 700;
          
          if (aspectRatio > 1) {
            // Landscape orientation
            canvasWidth = Math.min(maxWidth, activePage.pdf_page_width * 0.5);
            canvasHeight = canvasWidth / aspectRatio;
          } else {
            // Portrait orientation
            canvasHeight = Math.min(maxHeight, activePage.pdf_page_height * 0.5);
            canvasWidth = canvasHeight * aspectRatio;
          }
          
          console.log("[Canvas] Using PDF-based dimensions:", {
            pdfSize: { width: activePage.pdf_page_width, height: activePage.pdf_page_height },
            canvasSize: { width: canvasWidth, height: canvasHeight },
            aspectRatio
          });
        }
        
        const canvas = new FabricCanvas(canvasRef.current, {
          width: canvasWidth,
          height: canvasHeight,
          backgroundColor: "#ffffff",
          selection: true,
          preserveObjectStacking: true,
        });
        
        fabricCanvasRef.current = canvas;
        
        // Enhanced canvas event handling
        canvas.on('selection:created', (e) => {
          console.log("[Canvas] Zone selected:", e.selected?.[0]?.get('customProps'));
        });
        
        canvas.on('object:modified', (e) => {
          const obj = e.target;
          if (obj && activePage?.pdf_page_width && activePage?.pdf_page_height) {
            const props = obj.get('customProps' as any);
            if (props?.zoneType) {
              console.log("[Canvas] Zone modified:", {
                zone: props.name,
                canvasCoords: { x: obj.left, y: obj.top, width: obj.width, height: obj.height },
                pdfDimensions: { width: activePage.pdf_page_width, height: activePage.pdf_page_height }
              });
            }
          }
        });
        
        if (isEditing && templateId && templateData) {
          // Load page-specific background
          if (activePage?.preview_image_url) {
            console.log("[Canvas] Loading page preview image:", activePage.preview_image_url);
            await loadTemplateBackground(
              canvas, 
              activePage.preview_image_url,
              {
                width: canvasWidth,
                height: canvasHeight
              }
            );
          } else {
            console.log("[Canvas] No preview image URL available");
            toast.error("No preview image available for this page");
          }
        }
        
        setIsLoading(false);
        console.log("[Canvas] Canvas initialization complete");
        
      } catch (error) {
        console.error("[Canvas] Error initializing canvas:", error);
        toast.error(`Failed to initialize canvas: ${error.message}`);
        setIsLoading(false);
      }
    };
    
    if (activePage) {
      initializeCanvas();
    }
    
    return () => {
      if (fabricCanvasRef.current) {
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
      
      {/* Enhanced loading state with more info */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg backdrop-blur-sm">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <div className="text-sm text-gray-600 font-medium">Loading Canvas...</div>
            {activePage && (
              <div className="text-xs text-gray-500 mt-1">
                Page {activePage.page_number} • {activePage.pdf_page_width}×{activePage.pdf_page_height}pt
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Debug info overlay */}
      {activePage && !isLoading && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          Page {activePage.page_number} • 
          {activePage.preview_image_url ? ' Preview Available' : ' No Preview'} • 
          {activePage.pdf_page_width}×{activePage.pdf_page_height}pt
        </div>
      )}
    </div>
  );
};

export default Canvas;
