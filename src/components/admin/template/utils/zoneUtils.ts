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
    console.log("[loadTemplateBackground] Starting image load process:", {
      imageUrl,
      pageData,
      timestamp: new Date().toISOString()
    });
    
    // Test direct access to URL first
    const testResponse = await fetch(imageUrl, { 
      method: 'HEAD',
      mode: 'cors'
    });
    
    console.log("[loadTemplateBackground] URL accessibility test:", {
      status: testResponse.status,
      headers: Object.fromEntries(testResponse.headers.entries())
    });

    if (!testResponse.ok) {
      throw new Error(`URL not accessible: ${testResponse.status} ${testResponse.statusText}`);
    }

    // Calculate canvas dimensions first
    const canvasWidth = pageData?.width || 800;
    const canvasHeight = pageData?.height || 600;
    
    console.log("[loadTemplateBackground] Canvas dimensions:", { canvasWidth, canvasHeight });
    canvas.setWidth(canvasWidth);
    canvas.setHeight(canvasHeight);
    
    // Try multiple loading approaches
    let fabricImg: FabricImage | null = null;
    
    // Approach 1: Direct Fabric.js loading
    try {
      console.log("[loadTemplateBackground] Attempting Fabric.js direct load...");
      fabricImg = await FabricImage.fromURL(imageUrl, {
        crossOrigin: 'anonymous',
      });
      console.log("[loadTemplateBackground] Fabric.js direct load successful");
    } catch (fabricError) {
      console.warn("[loadTemplateBackground] Fabric.js direct load failed:", fabricError);
      
      // Approach 2: HTML Image element with manual Fabric creation
      try {
        console.log("[loadTemplateBackground] Attempting HTML Image load...");
        const htmlImg = await loadImageElement(imageUrl);
        console.log("[loadTemplateBackground] HTML Image loaded, creating Fabric image...");
        
        fabricImg = new FabricImage(htmlImg, {
          crossOrigin: 'anonymous',
        });
        console.log("[loadTemplateBackground] Manual Fabric image creation successful");
      } catch (htmlError) {
        console.error("[loadTemplateBackground] HTML Image load also failed:", htmlError);
        throw new Error(`All image loading methods failed. Last error: ${htmlError.message}`);
      }
    }

    if (!fabricImg) {
      throw new Error("Failed to create Fabric image object");
    }

    // Scale and position the image
    const imgWidth = fabricImg.width || 1;
    const imgHeight = fabricImg.height || 1;
    const imgAspectRatio = imgWidth / imgHeight;
    const canvasAspectRatio = canvasWidth / canvasHeight;
    
    console.log("[loadTemplateBackground] Image scaling:", {
      originalSize: { width: imgWidth, height: imgHeight },
      aspectRatio: imgAspectRatio,
      canvasAspectRatio
    });

    let scale: number;
    if (imgAspectRatio > canvasAspectRatio) {
      scale = canvasWidth / imgWidth;
    } else {
      scale = canvasHeight / imgHeight;
    }

    fabricImg.scale(scale);
    fabricImg.set({
      left: (canvasWidth - imgWidth * scale) / 2,
      top: (canvasHeight - imgHeight * scale) / 2,
      selectable: false,
      evented: false,
    });

    // Set as background and render
    canvas.backgroundImage = fabricImg;
    canvas.renderAll();
    
    console.log("[loadTemplateBackground] Background image set successfully");
    toast.success("PDF preview loaded successfully");
    
  } catch (error) {
    console.error("[loadTemplateBackground] Complete failure:", error);
    
    // Create enhanced fallback
    await createEnhancedFallback(canvas, pageData);
    
    // Still throw the error so caller knows it failed
    throw new Error(`Failed to load preview image: ${error.message}`);
  }
};

// Helper function to load image element with proper error handling
const loadImageElement = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      console.log("[loadImageElement] Image loaded successfully:", {
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete
      });
      resolve(img);
    };
    
    img.onerror = (error) => {
      console.error("[loadImageElement] Image load error:", error);
      reject(new Error(`Failed to load image from URL: ${url}`));
    };
    
    img.onabort = () => {
      console.error("[loadImageElement] Image load aborted");
      reject(new Error("Image loading was aborted"));
    };
    
    // Set properties before src to ensure they're applied
    img.crossOrigin = 'anonymous';
    img.src = url;
    
    // Timeout after 10 seconds
    setTimeout(() => {
      if (!img.complete) {
        reject(new Error("Image loading timeout"));
      }
    }, 10000);
  });
};

// Enhanced fallback with better visual feedback
const createEnhancedFallback = async (
  canvas: Canvas,
  pageData?: { width?: number; height?: number }
): Promise<void> => {
  const canvasWidth = pageData?.width || 800;
  const canvasHeight = pageData?.height || 600;
  
  console.log("[createEnhancedFallback] Creating fallback display");
  
  canvas.setWidth(canvasWidth);
  canvas.setHeight(canvasHeight);
  canvas.backgroundColor = '#f8f9fa';
  
  // Clear any existing objects
  canvas.clear();
  
  // Add grid pattern
  const gridSize = 40;
  const gridColor = '#e5e7eb';
  
  // Vertical lines
  for (let x = 0; x <= canvasWidth; x += gridSize) {
    const line = new FabricText('|', {
      left: x,
      top: 0,
      fontSize: canvasHeight,
      fill: gridColor,
      selectable: false,
      evented: false,
      fontFamily: 'monospace',
    });
    canvas.add(line);
  }
  
  // Add central message
  const mainText = new FabricText('PDF Preview', {
    left: canvasWidth / 2,
    top: canvasHeight / 2 - 30,
    fontSize: 24,
    fill: '#6b7280',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: 'bold',
    originX: 'center',
    originY: 'center',
    selectable: false,
    evented: false,
  });
  
  const subText = new FabricText('Could not load preview image', {
    left: canvasWidth / 2,
    top: canvasHeight / 2 + 10,
    fontSize: 14,
    fill: '#9ca3af',
    fontFamily: 'Inter, system-ui, sans-serif',
    originX: 'center',
    originY: 'center',
    selectable: false,
    evented: false,
  });
  
  const instructionText = new FabricText('You can still create customization zones', {
    left: canvasWidth / 2,
    top: canvasHeight / 2 + 40,
    fontSize: 12,
    fill: '#d1d5db',
    fontFamily: 'Inter, system-ui, sans-serif',
    originX: 'center',
    originY: 'center',
    selectable: false,
    evented: false,
  });
  
  canvas.add(mainText);
  canvas.add(subText);
  canvas.add(instructionText);
  
  canvas.renderAll();
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
