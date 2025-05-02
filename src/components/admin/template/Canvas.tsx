
import { useEffect, useRef } from "react";
import { Canvas as FabricCanvas } from "fabric";
import { toast } from "sonner";
import { renderZones, loadTemplateBackground } from "./utils/zoneUtils";

interface CanvasProps {
  isEditing: boolean;
  templateId?: string;
  templateData?: any;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  fabricCanvasRef: React.MutableRefObject<FabricCanvas | null>;
}

const Canvas = ({ 
  isEditing, 
  templateId, 
  templateData,
  isLoading,
  setIsLoading,
  fabricCanvasRef
}: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const initializeCanvas = async () => {
      try {
        if (!canvasRef.current) return;
        
        const canvas = new FabricCanvas(canvasRef.current, {
          width: 800,
          height: 600,
          backgroundColor: "#ffffff"
        });
        
        fabricCanvasRef.current = canvas;
        
        if (isEditing && templateId && templateData) {
          // Load background image if available
          if (templateData.baseImageUrl) {
            await loadTemplateBackground(canvas, templateData.baseImageUrl);
            
            // Load customization zones
            if (templateData.customizationZones && templateData.customizationZones.length > 0) {
              renderZones(canvas, templateData.customizationZones);
            }
          }
        }
        
        setIsLoading(false);
        
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
      }
    };
  }, [templateId, isEditing, templateData, setIsLoading, fabricCanvasRef]);
  
  return (
    <canvas ref={canvasRef} className="border-0" />
  );
};

export default Canvas;
