
import { Canvas, Group, Rect, Text as FabricText, Image as FabricImage } from "fabric";
import { ZonePageAssignment, TemplatePage } from "@/services/types/templateTypes";
import { vectorToCanvasCoordinates } from "@/components/admin/template/utils/zoneUtils";

export const setupCanvas = (canvas: Canvas, onZoneUpdate: (zoneId: string, updates: any) => void) => {
  // Set up canvas event listeners for customer interactions
  canvas.on('object:modified', (e) => {
    const obj = e.target;
    if (obj && obj.get('customProps' as any)?.zoneId) {
      const zoneId = obj.get('customProps' as any).zoneId;
      const updates = {
        x: obj.left || 0,
        y: obj.top || 0,
        width: (obj.width || 0) * (obj.scaleX || 1),
        height: (obj.height || 0) * (obj.scaleY || 1)
      };
      onZoneUpdate(zoneId, updates);
    }
  });

  // Enable selection and interaction
  canvas.selection = true;
  canvas.preserveObjectStacking = true;
};

export const loadPageBackground = async (canvas: Canvas, backgroundImageUrl: string) => {
  try {
    const img = await FabricImage.fromURL(backgroundImageUrl, {
      crossOrigin: 'anonymous',
    });

    // Scale image to fit canvas
    const canvasWidth = canvas.width || 800;
    const canvasHeight = canvas.height || 600;
    const scaleX = canvasWidth / (img.width || 1);
    const scaleY = canvasHeight / (img.height || 1);
    const scale = Math.min(scaleX, scaleY);

    img.scale(scale);
    img.set({
      left: 0,
      top: 0,
      selectable: false,
      evented: false,
    });

    // Add as background
    canvas.backgroundImage = img;
    canvas.renderAll();
  } catch (error) {
    console.error("Error loading page background:", error);
  }
};

export const loadCustomizationZones = async (
  canvas: Canvas,
  templateId: string,
  pageId: string,
  customizations: any[]
) => {
  // This would typically load zone assignments from the database
  // For now, we'll use a placeholder implementation
  console.log("Loading customization zones for page:", pageId);
  
  // Clear existing zones
  const existingZones = canvas.getObjects().filter(obj => 
    obj.get('customProps' as any)?.isCustomerContent
  );
  existingZones.forEach(obj => canvas.remove(obj));

  // Apply customizations to zones
  customizations.forEach(customization => {
    if (customization.type === 'text' && customization.content) {
      const text = new FabricText(customization.content, {
        left: customization.x || 100,
        top: customization.y || 100,
        fontSize: 16,
        fill: '#000000',
        selectable: true,
      });

      text.set('customProps', {
        isCustomerContent: true,
        zoneId: customization.zoneId,
        contentType: 'text'
      });

      canvas.add(text);
    }
  });

  canvas.renderAll();
};

export const renderCustomerZones = async (
  canvas: Canvas,
  zoneAssignments: ZonePageAssignment[],
  activePage: TemplatePage,
  pageDesign: any
) => {
  // Clear existing customer content
  const existingContent = canvas.getObjects().filter(obj => 
    obj.get('customProps' as any)?.isCustomerContent
  );
  existingContent.forEach(obj => canvas.remove(obj));

  // Render each zone assignment as a customizable area
  for (const assignment of zoneAssignments) {
    let canvasX = assignment.x;
    let canvasY = assignment.y;
    let canvasWidth = assignment.width;
    let canvasHeight = assignment.height;

    // Convert from vector coordinates if PDF dimensions are available
    if (activePage.pdf_page_width && activePage.pdf_page_height) {
      const canvasCoords = vectorToCanvasCoordinates(
        assignment.x,
        assignment.y,
        activePage.pdf_page_width,
        activePage.pdf_page_height,
        canvas.width || 800,
        canvas.height || 600
      );

      const canvasDims = vectorToCanvasCoordinates(
        assignment.width,
        assignment.height,
        activePage.pdf_page_width,
        activePage.pdf_page_height,
        canvas.width || 800,
        canvas.height || 600
      );

      canvasX = canvasCoords.x;
      canvasY = canvasCoords.y;
      canvasWidth = canvasDims.x;
      canvasHeight = canvasDims.y;
    }

    // Check if this zone has customer content
    const zoneContent = pageDesign.zones[assignment.id];
    
    if (zoneContent) {
      if (zoneContent.type === 'text' && zoneContent.content) {
        await renderCustomerText(canvas, assignment, canvasX, canvasY, canvasWidth, canvasHeight, zoneContent);
      } else if (zoneContent.type === 'image' && zoneContent.imageUrl) {
        await renderCustomerImage(canvas, assignment, canvasX, canvasY, canvasWidth, canvasHeight, zoneContent);
      }
    } else {
      // Render placeholder zone
      renderPlaceholderZone(canvas, assignment, canvasX, canvasY, canvasWidth, canvasHeight);
    }
  }

  canvas.renderAll();
};

const renderCustomerText = async (
  canvas: Canvas,
  assignment: ZonePageAssignment,
  x: number,
  y: number,
  width: number,
  height: number,
  content: any
) => {
  const fontSize = Math.max(10, Math.min(24, Math.min(width / 8, height / 2)));
  
  const text = new FabricText(content.content, {
    left: x,
    top: y,
    width: width,
    fontSize: fontSize,
    fontFamily: 'Inter, system-ui, sans-serif',
    fill: '#1f2937',
    textAlign: 'center',
    selectable: true,
    hasControls: true,
    hasBorders: true,
    borderColor: '#3b82f6',
    cornerColor: '#3b82f6',
    cornerStyle: 'circle',
    cornerSize: 8,
    transparentCorners: false,
  });

  text.set('customProps', {
    isCustomerContent: true,
    zoneId: assignment.id,
    contentType: 'text'
  });

  canvas.add(text);
};

const renderCustomerImage = async (
  canvas: Canvas,
  assignment: ZonePageAssignment,
  x: number,
  y: number,
  width: number,
  height: number,
  content: any
) => {
  try {
    const img = await FabricImage.fromURL(content.imageUrl, {
      crossOrigin: 'anonymous',
    });

    // Scale image to fit zone while maintaining aspect ratio
    const scaleX = width / (img.width || 1);
    const scaleY = height / (img.height || 1);
    const scale = Math.min(scaleX, scaleY);

    img.scale(scale);
    img.set({
      left: x + (width - (img.width || 0) * scale) / 2,
      top: y + (height - (img.height || 0) * scale) / 2,
      selectable: true,
      hasControls: true,
      hasBorders: true,
      borderColor: '#10b981',
      cornerColor: '#10b981',
      cornerStyle: 'circle',
      cornerSize: 8,
      transparentCorners: false,
    });

    img.set('customProps', {
      isCustomerContent: true,
      zoneId: assignment.id,
      contentType: 'image'
    });

    canvas.add(img);
  } catch (error) {
    console.error("Error loading customer image:", error);
    // Fallback to placeholder
    renderPlaceholderZone(canvas, assignment, x, y, width, height);
  }
};

const renderPlaceholderZone = (
  canvas: Canvas,
  assignment: ZonePageAssignment,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  // Determine zone type (simplified logic)
  const isImageZone = !assignment.is_repeating;
  const fillColor = isImageZone ? 'rgba(156, 163, 175, 0.1)' : 'rgba(249, 115, 22, 0.1)';
  const strokeColor = isImageZone ? 'rgba(156, 163, 175, 0.4)' : 'rgba(249, 115, 22, 0.4)';
  const textColor = isImageZone ? '#6b7280' : '#ea580c';

  const rect = new Rect({
    left: 0,
    top: 0,
    width,
    height,
    fill: fillColor,
    stroke: strokeColor,
    strokeWidth: 1,
    strokeDashArray: [6, 3],
    rx: 4,
    ry: 4,
    selectable: false,
  });

  const fontSize = Math.max(10, Math.min(16, Math.min(width / 10, height / 3)));
  const placeholderText = isImageZone ? 'Click to add image' : 'Click to add text';

  const text = new FabricText(placeholderText, {
    left: width / 2,
    top: height / 2,
    fontSize,
    originX: 'center',
    originY: 'center',
    fontWeight: '500',
    fill: textColor,
    selectable: false,
    fontFamily: 'Inter, system-ui, sans-serif',
    textAlign: 'center',
  });

  const group = new Group([rect, text], {
    left: x,
    top: y,
    selectable: true,
    hasControls: false,
    hasBorders: true,
    borderColor: strokeColor,
    hoverCursor: 'pointer',
  });

  group.set('customProps', {
    isCustomerContent: false,
    isPlaceholder: true,
    zoneId: assignment.id,
    zoneType: isImageZone ? 'image' : 'text'
  });

  canvas.add(group);
};
