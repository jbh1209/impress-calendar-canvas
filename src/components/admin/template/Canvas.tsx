
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
        
        console.log("[Canvas] Initializing canvas for page:", activePage?.page_number);
        
        // Dispose of existing canvas
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.dispose();
        }
        
        // Calculate canvas dimensions based on PDF page or use defaults
        let canvasWidth = 800;
        let canvasHeight = 600;
        
        if (activePage?.pdf_page_width && activePage?.pdf_page_height) {
          // Scale PDF dimensions to fit canvas while maintaining aspect ratio
          const aspectRatio = activePage.pdf_page_width / activePage.pdf_page_height;
          
          if (aspectRatio > 1) {
            // Landscape
            canvasWidth = 800;
            canvasHeight = 800 / aspectRatio;
          } else {
            // Portrait
            canvasHeight = 600;
            canvasWidth = 600 * aspectRatio;
          }
        }
        
        const canvas = new FabricCanvas(canvasRef.current, {
          width: canvasWidth,
          height: canvasHeight,
          backgroundColor: "#ffffff",
          selection: true,
        });
        
        fabricCanvasRef.current = canvas;
        
        if (isEditing && templateId && templateData) {
          // Load page-specific background if available
          if (activePage?.preview_image_url) {
            await loadTemplateBackground(
              canvas, 
              activePage.preview_image_url,
              {
                width: canvasWidth,
                height: canvasHeight
              }
            );
          } else if (templateData.base_image_url) {
            // Fallback to template base image
            await loadTemplateBackground(canvas, templateData.base_image_url);
          }
          
          // Load customization zones for this page
          if (templateData.customization_zones && templateData.customization_zones.length > 0) {
            renderZones(canvas, templateData.customization_zones);
          }
        }
        
        // Add canvas event listeners
        canvas.on('selection:created', (e) => {
          console.log("[Canvas] Object selected:", e.selected);
        });
        
        canvas.on('object:modified', (e) => {
          console.log("[Canvas] Object modified:", e.target);
          // Here we could auto-save zone positions
        });
        
        setIsLoading(false);
        console.log("[Canvas] Canvas initialized successfully");
        
      } catch (error) {
        console.error("Error initializing canvas:", error);
        toast.error("Failed to initialize template editor");
        setIsLoading(false);
      }
    };
    
    initializeCanvas();
    
    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [templateId, isEditing, templateData, activePage, setIsLoading, fabricCanvasRef]);
  
  return (
    <div className="relative">
      <canvas ref={canvasRef} className="border border-gray-200 rounded-lg shadow-sm" />
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="text-sm text-gray-600">Loading canvas...</div>
        </div>
      )}
    </div>
  );
};

export default Canvas;
