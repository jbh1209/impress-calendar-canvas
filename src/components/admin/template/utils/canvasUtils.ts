
import { Canvas as FabricCanvas, Image as FabricImage, Rect, Text as FabricText } from "fabric";
import { TemplatePage } from "@/services/types/templateTypes";

export const getCanvasDimensions = (templateDimensions?: {
  width: number;
  height: number;
  units: string;
}) => {
  if (!templateDimensions) {
    return { width: 800, height: 600 };
  }

  // Convert to pixels (72 DPI for inches, 2.83 pixels per mm)
  const pixelsPerUnit = templateDimensions.units === 'in' ? 72 : 2.83;
  const templateWidthPx = templateDimensions.width * pixelsPerUnit;
  const templateHeightPx = templateDimensions.height * pixelsPerUnit;
  
  // Scale to fit in the available space (max 1000x700)
  const maxWidth = 1000;
  const maxHeight = 700;
  
  const scale = Math.min(
    maxWidth / templateWidthPx,
    maxHeight / templateHeightPx,
    1 // Don't scale up
  );
  
  return {
    width: Math.round(templateWidthPx * scale),
    height: Math.round(templateHeightPx * scale)
  };
};

export const createPlaceholderBackground = (
  canvas: FabricCanvas, 
  canvasWidth: number, 
  canvasHeight: number, 
  activePage: TemplatePage,
  templateDimensions?: {
    width: number;
    height: number;
    units: string;
  }
) => {
  try {
    // Create a clean background with page info
    const bgRect = new Rect({
      left: 0,
      top: 0,
      width: canvasWidth,
      height: canvasHeight,
      fill: '#ffffff',
      stroke: '#e5e7eb',
      strokeWidth: 2,
      selectable: false,
      evented: false,
    });

    const titleText = new FabricText(`Page ${activePage.page_number}`, {
      left: canvasWidth / 2,
      top: 50,
      fontSize: 24,
      fill: '#374151',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontWeight: 'bold',
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
    });

    const dimensionText = new FabricText(
      templateDimensions ? 
      `${templateDimensions.width} × ${templateDimensions.height} ${templateDimensions.units}` :
      `${Math.round(activePage.pdf_page_width || 0)} × ${Math.round(activePage.pdf_page_height || 0)} pt`,
      {
        left: canvasWidth / 2,
        top: 90,
        fontSize: 14,
        fill: '#6b7280',
        fontFamily: 'Inter, system-ui, sans-serif',
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
      }
    );

    const instructionText = new FabricText('Preview image not available - Add zones using the buttons above', {
      left: canvasWidth / 2,
      top: canvasHeight - 50,
      fontSize: 12,
      fill: '#9ca3af',
      fontFamily: 'Inter, system-ui, sans-serif',
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
    });

    canvas.add(bgRect);
    canvas.add(titleText);
    canvas.add(dimensionText);
    canvas.add(instructionText);
    canvas.renderAll();

  } catch (error) {
    console.error('Error creating placeholder:', error);
    throw error;
  }
};

export const loadPreviewImage = async (
  canvas: FabricCanvas,
  previewImageUrl: string,
  canvasDimensions: { width: number; height: number }
) => {
  const img = await FabricImage.fromURL(previewImageUrl);
  
  // Scale image to fit canvas
  const imgScale = Math.min(
    canvasDimensions.width / img.width!,
    canvasDimensions.height / img.height!
  );
  
  img.set({
    left: 0,
    top: 0,
    scaleX: imgScale,
    scaleY: imgScale,
    selectable: false,
    evented: false,
  });

  canvas.add(img);
  canvas.sendObjectToBack(img);
  canvas.renderAll();
  
  return img;
};
