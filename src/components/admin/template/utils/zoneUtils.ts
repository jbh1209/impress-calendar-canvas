
import { Canvas, Group, Rect, Text as FabricText, Image as FabricImage } from "fabric";
import { toast } from "sonner";
import { CustomizationZone } from "@/services/types/templateTypes";

// Custom properties interface to handle zone data
interface CustomProps {
  zoneId?: string;
  zoneType: 'image' | 'text';
  name: string;
  vectorCoordinates?: {
    x: number;
    y: number;
    width: number;
    height: number;
    pageWidth: number;
    pageHeight: number;
  };
}

// Create a zone group with proper styling and properties
export const createZoneGroup = (zoneData: {
  name: string;
  type: 'image' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex?: number;
  zoneId?: string;
}): Group => {
  const { name, type, x, y, width, height, zIndex = 0, zoneId } = zoneData;
  
  const rect = new Rect({
    left: 0,
    top: 0,
    width,
    height,
    fill: type === 'image' ? 'rgba(0, 150, 255, 0.2)' : 'rgba(255, 150, 0, 0.2)',
    stroke: type === 'image' ? 'rgba(0, 150, 255, 0.8)' : 'rgba(255, 150, 0, 0.8)',
    strokeWidth: 2,
    strokeDashArray: [5, 5],
    rx: 8,
    ry: 8,
    selectable: false,
  });
  
  const text = new FabricText(name, {
    left: width / 2,
    top: height / 2,
    fontSize: Math.min(12, width / 8),
    originX: 'center',
    originY: 'center',
    fontWeight: 'bold',
    fill: type === 'image' ? '#0066cc' : '#cc6600',
    selectable: false,
    fontFamily: 'Arial, sans-serif',
  });
  
  const group = new Group([rect, text], {
    left: x,
    top: y,
    selectable: true,
    hasControls: true,
    hasBorders: true,
    borderColor: type === 'image' ? '#0066cc' : '#cc6600',
    cornerColor: type === 'image' ? '#0066cc' : '#cc6600',
    cornerStyle: 'circle',
    cornerSize: 8,
    transparentCorners: false,
  });
  
  // Set custom properties
  group.set('customProps', {
    zoneId,
    zoneType: type,
    name,
  } as CustomProps);
  
  return group;
};

export const renderZones = (canvas: Canvas, zones: CustomizationZone[]): void => {
  try {
    console.log("[renderZones] Rendering zones:", zones);
    
    // Clear existing zones first
    const existingZones = canvas.getObjects().filter(obj => 
      obj.get('customProps' as any)?.zoneType
    );
    existingZones.forEach(zone => canvas.remove(zone));
    
    zones.forEach((zone) => {
      const zoneGroup = createZoneGroup({
        name: zone.name,
        type: zone.type,
        x: zone.x,
        y: zone.y,
        width: zone.width,
        height: zone.height,
        zIndex: zone.z_index || 0,
        zoneId: zone.id,
      });
      
      canvas.add(zoneGroup);
    });
    
    canvas.renderAll();
    toast.success(`Loaded ${zones.length} customization zones`);
  } catch (error) {
    console.error("Error rendering zones:", error);
    toast.error("Failed to render template zones");
  }
};

export const loadTemplateBackground = async (
  canvas: Canvas, 
  imageUrl: string,
  pageData?: { width?: number; height?: number }
): Promise<void> => {
  try {
    console.log("[loadTemplateBackground] Loading background:", imageUrl);
    
    const img = await FabricImage.fromURL(imageUrl, {
      crossOrigin: 'anonymous',
    });
    
    // Set canvas size based on page data or scale to fit
    const canvasWidth = pageData?.width || 800;
    const canvasHeight = pageData?.height || 600;
    
    canvas.setWidth(canvasWidth);
    canvas.setHeight(canvasHeight);
    
    // Scale image to fit canvas while maintaining aspect ratio
    const scaleX = canvasWidth / (img.width || 1);
    const scaleY = canvasHeight / (img.height || 1);
    const scale = Math.min(scaleX, scaleY);
    
    img.scale(scale);
    img.set({
      left: (canvasWidth - (img.width || 0) * scale) / 2,
      top: (canvasHeight - (img.height || 0) * scale) / 2,
      selectable: false,
      evented: false,
    });
    
    canvas.backgroundImage = img;
    canvas.renderAll();
    
    console.log("[loadTemplateBackground] Background loaded successfully");
  } catch (error) {
    console.error("Error loading background image:", error);
    toast.error("Failed to load template background");
    throw error;
  }
};

// Helper to convert canvas coordinates to vector PDF coordinates
export const canvasToVectorCoordinates = (
  canvasX: number,
  canvasY: number,
  canvasWidth: number,
  canvasHeight: number,
  pdfWidth: number,
  pdfHeight: number
): { x: number; y: number } => {
  const scaleX = pdfWidth / canvasWidth;
  const scaleY = pdfHeight / canvasHeight;
  
  return {
    x: canvasX * scaleX,
    y: canvasY * scaleY,
  };
};

// Helper to convert vector PDF coordinates to canvas coordinates
export const vectorToCanvasCoordinates = (
  vectorX: number,
  vectorY: number,
  pdfWidth: number,
  pdfHeight: number,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } => {
  const scaleX = canvasWidth / pdfWidth;
  const scaleY = canvasHeight / pdfHeight;
  
  return {
    x: vectorX * scaleX,
    y: vectorY * scaleY,
  };
};
