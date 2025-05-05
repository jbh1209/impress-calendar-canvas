
import { Canvas, Group, Rect, Text as FabricText, Image as FabricImage } from "fabric";
import { toast } from "sonner";
import { CustomizationZone } from "@/services/types/templateTypes";

// Custom properties interface to handle zone data
interface CustomProps {
  zoneId: string;
  zoneType: 'image' | 'text';
  name: string;
}

export const renderZones = (canvas: Canvas, zones: CustomizationZone[]): void => {
  try {
    zones.forEach((zone) => {
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
      } as CustomProps);
      
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
      } as CustomProps);
      
      canvas.add(zoneGroup);
    });
  } catch (error) {
    console.error("Error rendering zones:", error);
    toast.error("Failed to render template zones");
  }
};

export const loadTemplateBackground = async (
  canvas: Canvas, 
  imageUrl: string
): Promise<void> => {
  try {
    const img = await FabricImage.fromURL(imageUrl, {
      crossOrigin: 'anonymous',
    });
    
    canvas.setWidth(800);
    canvas.setHeight(600);
    
    img.scaleToWidth(canvas.width || 800);
    canvas.backgroundImage = img;
    canvas.renderAll();
  } catch (error) {
    console.error("Error loading background image:", error);
    toast.error("Failed to load template background image");
    throw error;
  }
};
