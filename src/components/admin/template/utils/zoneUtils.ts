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
  
  // Enhanced visual styling for different zone types
  const isImageZone = type === 'image';
  const fillColor = isImageZone ? 'rgba(59, 130, 246, 0.15)' : 'rgba(245, 158, 11, 0.15)';
  const strokeColor = isImageZone ? 'rgba(59, 130, 246, 0.8)' : 'rgba(245, 158, 11, 0.8)';
  const textColor = isImageZone ? '#1d4ed8' : '#d97706';
  
  const rect = new Rect({
    left: 0,
    top: 0,
    width,
    height,
    fill: fillColor,
    stroke: strokeColor,
    strokeWidth: 2,
    strokeDashArray: [8, 4],
    rx: 6,
    ry: 6,
    selectable: false,
  });
  
  // Smart text sizing based on zone dimensions
  const fontSize = Math.max(8, Math.min(14, Math.min(width / 12, height / 3)));
  
  const text = new FabricText(name, {
    left: width / 2,
    top: height / 2,
    fontSize,
    originX: 'center',
    originY: 'center',
    fontWeight: '600',
    fill: textColor,
    selectable: false,
    fontFamily: 'Inter, system-ui, sans-serif',
    textAlign: 'center',
  });
  
  const group = new Group([rect, text], {
    left: x,
    top: y,
    selectable: true,
    hasControls: true,
    hasBorders: true,
    borderColor: strokeColor,
    cornerColor: strokeColor,
    cornerStyle: 'circle',
    cornerSize: 10,
    transparentCorners: false,
    borderDashArray: [5, 5],
  });
  
  // Enhanced custom properties with vector coordinates
  group.set('customProps', {
    zoneId,
    zoneType: type,
    name,
    vectorCoordinates: {
      x,
      y,
      width,
      height,
      pageWidth: 0, // Will be set when saving
      pageHeight: 0
    }
  } as CustomProps);
  
  // Add event listeners for real-time coordinate tracking
  group.on('moving', () => {
    console.log(`Zone "${name}" moved to:`, { x: group.left, y: group.top });
  });
  
  group.on('scaling', () => {
    console.log(`Zone "${name}" scaled:`, { 
      width: group.width! * group.scaleX!, 
      height: group.height! * group.scaleY! 
    });
  });
  
  return group;
};

export const renderZones = (canvas: Canvas, zones: CustomizationZone[]): void => {
  try {
    console.log("[renderZones] Rendering zones with vector awareness:", zones);
    
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
    toast.success(`Loaded ${zones.length} customization zones with vector precision`);
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
    console.log("[loadTemplateBackground] Starting to load background image:", imageUrl);
    
    // Test if the image URL is accessible
    try {
      const testResponse = await fetch(imageUrl, { method: 'HEAD' });
      console.log("[loadTemplateBackground] Image accessibility test:", testResponse.status);
      
      if (!testResponse.ok) {
        throw new Error(`Image not accessible: ${testResponse.status} ${testResponse.statusText}`);
      }
    } catch (fetchError) {
      console.error("[loadTemplateBackground] Image fetch test failed:", fetchError);
      toast.error("Preview image is not accessible");
      return;
    }
    
    // Load the image with better error handling
    const img = await new Promise<FabricImage>((resolve, reject) => {
      FabricImage.fromURL(imageUrl, {
        crossOrigin: 'anonymous',
      }).then((loadedImg) => {
        console.log("[loadTemplateBackground] Image loaded successfully:", {
          width: loadedImg.width,
          height: loadedImg.height,
          src: imageUrl
        });
        resolve(loadedImg);
      }).catch((error) => {
        console.error("[loadTemplateBackground] Fabric image loading failed:", error);
        reject(error);
      });
    });
    
    // Set canvas size based on PDF page data for accurate vector mapping
    const canvasWidth = pageData?.width || 800;
    const canvasHeight = pageData?.height || 600;
    
    console.log("[loadTemplateBackground] Setting canvas dimensions:", { canvasWidth, canvasHeight });
    
    canvas.setWidth(canvasWidth);
    canvas.setHeight(canvasHeight);
    
    // Maintain aspect ratio while fitting to canvas
    const imgAspectRatio = (img.width || 1) / (img.height || 1);
    const canvasAspectRatio = canvasWidth / canvasHeight;
    
    let scale: number;
    if (imgAspectRatio > canvasAspectRatio) {
      // Image is wider than canvas
      scale = canvasWidth / (img.width || 1);
    } else {
      // Image is taller than canvas
      scale = canvasHeight / (img.height || 1);
    }
    
    console.log("[loadTemplateBackground] Calculated scale:", scale);
    
    img.scale(scale);
    img.set({
      left: (canvasWidth - (img.width || 0) * scale) / 2,
      top: (canvasHeight - (img.height || 0) * scale) / 2,
      selectable: false,
      evented: false,
      hoverCursor: 'default',
      moveCursor: 'default',
    });
    
    // Set as background image
    canvas.backgroundImage = img;
    canvas.renderAll();
    
    console.log("[loadTemplateBackground] Background image set successfully");
    toast.success("PDF preview loaded successfully");
    
  } catch (error) {
    console.error("[loadTemplateBackground] Complete error:", error);
    toast.error(`Failed to load PDF preview: ${error.message}`);
    
    // Add fallback background
    canvas.backgroundColor = '#f8f9fa';
    canvas.renderAll();
    
    // Add a placeholder text
    const placeholderText = new FabricText('PDF Preview Failed to Load', {
      left: canvas.width! / 2,
      top: canvas.height! / 2,
      fontSize: 16,
      fill: '#6b7280',
      fontFamily: 'Inter, system-ui, sans-serif',
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
    });
    
    canvas.add(placeholderText);
    canvas.renderAll();
  }
};

// Enhanced coordinate conversion with precision handling
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
  
  // Round to 3 decimal places for PDF precision
  return {
    x: Math.round(canvasX * scaleX * 1000) / 1000,
    y: Math.round(canvasY * scaleY * 1000) / 1000,
  };
};

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
    x: Math.round(vectorX * scaleX * 100) / 100,
    y: Math.round(vectorY * scaleY * 100) / 100,
  };
};

// Utility to convert zone dimensions while maintaining aspect ratio
export const convertZoneDimensions = (
  width: number,
  height: number,
  fromPdfWidth: number,
  fromPdfHeight: number,
  toPdfWidth: number,
  toPdfHeight: number
): { width: number; height: number } => {
  const scaleX = toPdfWidth / fromPdfWidth;
  const scaleY = toPdfHeight / fromPdfHeight;
  
  return {
    width: Math.round(width * scaleX * 1000) / 1000,
    height: Math.round(height * scaleY * 1000) / 1000,
  };
};

// Get vector coordinates for a canvas object
export const getVectorCoordinatesFromCanvasObject = (
  obj: any,
  canvasWidth: number,
  canvasHeight: number,
  pdfWidth: number,
  pdfHeight: number
): CustomProps['vectorCoordinates'] => {
  const vectorCoords = canvasToVectorCoordinates(
    obj.left || 0,
    obj.top || 0,
    canvasWidth,
    canvasHeight,
    pdfWidth,
    pdfHeight
  );
  
  const vectorDims = canvasToVectorCoordinates(
    obj.width || 100,
    obj.height || 100,
    canvasWidth,
    canvasHeight,
    pdfWidth,
    pdfHeight
  );
  
  return {
    x: vectorCoords.x,
    y: vectorCoords.y,
    width: vectorDims.x,
    height: vectorDims.y,
    pageWidth: pdfWidth,
    pageHeight: pdfHeight
  };
};
