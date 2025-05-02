
import { useEffect, useRef } from "react";
import { Canvas, Group, Image as FabricImage, Rect, Text as FabricText } from "fabric";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Image, Text } from "lucide-react";

interface TemplateCanvasProps {
  isEditing: boolean;
  templateId?: string;
  templateData?: any;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

// Define custom types for zone data to handle custom properties
export interface CustomZoneData {
  zoneId: number;
  zoneType: 'image' | 'text';
  name: string;
}

const TemplateCanvas = ({ 
  isEditing, 
  templateId, 
  templateData,
  isLoading,
  setIsLoading
}: TemplateCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);

  useEffect(() => {
    const loadFabric = async () => {
      try {
        if (!canvasRef.current) return;
        
        const canvas = new Canvas(canvasRef.current, {
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
                
                // Add zone metadata using set() with custom properties
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
  }, [templateId, isEditing, templateData, setIsLoading]);
  
  const handleAddZone = (type: 'image' | 'text') => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    const zoneId = Date.now();
    const zoneName = type === 'image' ? `Image Zone ${zoneId}` : `Text Zone ${zoneId}`;
    
    try {
      const rect = new Rect({
        left: 100,
        top: 100,
        width: type === 'image' ? 200 : 150,
        height: type === 'image' ? 150 : 50,
        fill: type === 'image' ? 'rgba(0, 150, 255, 0.3)' : 'rgba(255, 150, 0, 0.3)',
        stroke: type === 'image' ? 'rgba(0, 150, 255, 1)' : 'rgba(255, 150, 0, 1)',
        strokeWidth: 2,
        rx: 5,
        ry: 5,
        selectable: true,
      });
      
      // Set custom properties to the rect
      rect.set('customProps', { 
        zoneId, 
        zoneType: type, 
        name: zoneName 
      });
      
      const text = new FabricText(zoneName, {
        fontSize: 14,
        originX: 'center',
        originY: 'center',
        left: rect.width! / 2,
        top: rect.height! / 2,
        fontWeight: 'bold',
        selectable: false
      });
      
      const group = new Group([rect, text], {
        left: 100,
        top: 100,
        selectable: true,
        hasControls: true,
      });
      
      // Set custom properties to the group
      group.set('customProps', { 
        zoneId, 
        zoneType: type, 
        name: zoneName 
      });
      
      canvas.add(group);
      canvas.setActiveObject(group);
      canvas.renderAll();
      
      toast.success(`Added new ${type} zone`);
    } catch (error) {
      console.error("Error adding zone:", error);
      toast.error("Failed to add zone");
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {isLoading ? (
        <div className="w-full h-[600px] bg-gray-100 animate-pulse flex items-center justify-center">
          Loading editor...
        </div>
      ) : (
        <div className="relative">
          <canvas ref={canvasRef} className="border-0" />
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button size="sm" onClick={() => handleAddZone('image')} className="flex gap-2 items-center">
              <Image className="w-4 h-4" />
              Add Image Zone
            </Button>
            <Button size="sm" onClick={() => handleAddZone('text')} className="flex gap-2 items-center">
              <Text className="w-4 h-4" />
              Add Text Zone
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateCanvas;
