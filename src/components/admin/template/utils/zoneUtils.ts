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
    console.log("[loadTemplateBackground] Starting to load:", imageUrl);
    
    // Simple direct image loading approach
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        console.log("[loadTemplateBackground] Image loaded successfully:", {
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          src: imageUrl
        });
        resolve();
      };
      
      img.onerror = (error) => {
        console.error("[loadTemplateBackground] Image load failed:", error);
        reject(new Error(`Failed to load image: ${imageUrl}`));
      };
      
      // Set the source to trigger loading
      img.src = imageUrl;
    });
    
    // Create Fabric image from the loaded HTML image
    const fabricImg = await new Promise<FabricImage>((resolve, reject) => {
      FabricImage.fromURL(imageUrl, {
        crossOrigin: 'anonymous',
      }).then((loadedImg) => {
        console.log("[loadTemplateBackground] Fabric image created");
        resolve(loadedImg);
      }).catch((error) => {
        console.error("[loadTemplateBackground] Fabric image creation failed:", error);
        reject(error);
      });
    });
    
    // Calculate canvas dimensions
    const canvasWidth = pageData?.width || 800;
    const canvasHeight = pageData?.height || 600;
    
    console.log("[loadTemplateBackground] Setting canvas size:", { canvasWidth, canvasHeight });
    canvas.setWidth(canvasWidth);
    canvas.setHeight(canvasHeight);
    
    // Scale the image to fit the canvas
    const imgAspectRatio = (fabricImg.width || 1) / (fabricImg.height || 1);
    const canvasAspectRatio = canvasWidth / canvasHeight;
    
    let scale: number;
    if (imgAspectRatio > canvasAspectRatio) {
      scale = canvasWidth / (fabricImg.width || 1);
    } else {
      scale = canvasHeight / (fabricImg.height || 1);
    }
    
    fabricImg.scale(scale);
    fabricImg.set({
      left: (canvasWidth - (fabricImg.width || 0) * scale) / 2,
      top: (canvasHeight - (fabricImg.height || 0) * scale) / 2,
      selectable: false,
      evented: false,
    });
    
    // Set as background image and render
    canvas.backgroundImage = fabricImg;
    canvas.renderAll();
    
    console.log("[loadTemplateBackground] Background set successfully");
    
  } catch (error) {
    console.error("[loadTemplateBackground] Error:", error);
    
    // Fallback: Create a simple placeholder
    const canvasWidth = pageData?.width || 800;
    const canvasHeight = pageData?.height || 600;
    
    canvas.setWidth(canvasWidth);
    canvas.setHeight(canvasHeight);
    canvas.backgroundColor = '#f8f9fa';
    
    // Add placeholder text
    const placeholderText = new FabricText('PDF Preview\nNot Available', {
      left: canvasWidth / 2,
      top: canvasHeight / 2,
      fontSize: 24,
      fill: '#6b7280',
      fontFamily: 'Inter, system-ui, sans-serif',
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
      textAlign: 'center',
    });
    
    canvas.add(placeholderText);
    canvas.renderAll();
    
    throw error;
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
