
import { useEffect, useRef } from "react";
import { Canvas as FabricCanvas, Group, Image as FabricImage, Rect, Text as FabricText } from "fabric";
import { toast } from "sonner";

interface CanvasProps {
  isEditing: boolean;
  templateId?: string;
  templateData?: any;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  fabricCanvasRef: React.MutableRefObject<FabricCanvas | null>;
}

// Define custom types for zone data to handle custom properties
export interface CustomZoneData {
  zoneId: number;
  zoneType: 'image' | 'text';
  name: string;
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
    const loadFabric = async () => {
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
            try {
              const img = await FabricImage.fromURL(templateData.baseImageUrl, {
                crossOrigin: 'anonymous',
                signal: new AbortController().signal,
              });
              
              canvas.setWidth(800);
              canvas.setHeight(600);
              
              img.scaleToWidth(canvas.width || 800);
              canvas.backgroundImage = img;
              canvas.renderAll();
              
              // Load customization zones
              templateData.customizationZones.forEach((zone: any) => {
                const rect = new Rect({
                  left: zone.x,
                  top: zone.y,
                  width: zone.width,
                  height: zone.height,
                  fill: zone.type === 'image' ? 'rgba(0, 150, 255, 0.3)' : 'rgba(255, 150, 0, 0.3)',
                  stroke: zone.type === 'image' ? 'rgba(0, 150, 255, 1)' : 'rgba(255, 150, 0, 1)',
                  strokeWidth: 2,
                  rx: 5,
                  ry: 5,
                  selectable: true,
                });
                
                // Add zone metadata using custom properties
                rect.set('customProps', { 
                  zoneId: zone.id, 
                  zoneType: zone.type, 
                  name: zone.name 
                });
                
                // Add label to zone
                const text = new FabricText(zone.name, {
                  left: zone.width / 2,
                  top: zone.height / 2,
                  fontSize: 14,
                  originX: 'center',
                  originY: 'center',
                  fontWeight: 'bold',
                  selectable: false
                });
                
                const zoneGroup = new Group([rect, text], {
                  left: zone.x,
                  top: zone.y,
                  selectable: true,
                  hasControls: true,
                });
                
                // Set custom properties to the group
                zoneGroup.set('customProps', { 
                  zoneId: zone.id, 
                  zoneType: zone.type, 
                  name: zone.name 
                });
                
                canvas.add(zoneGroup);
              });
            } catch (error) {
              console.error("Error loading background image:", error);
              toast.error("Failed to load template background image");
            }
          }
        }
        
        setIsLoading(false);
        
      } catch (error) {
        console.error("Error loading Fabric.js:", error);
        toast.error("Failed to load template editor");
        setIsLoading(false);
      }
    };
    
    loadFabric();
    
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
