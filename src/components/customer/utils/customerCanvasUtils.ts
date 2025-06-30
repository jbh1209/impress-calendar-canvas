
import { Canvas as FabricCanvas, FabricImage, FabricText } from "fabric";
import { Template, TemplatePage, CustomizationZone } from "@/services/types/templateTypes";

export const setupCanvas = (
  canvas: FabricCanvas,
  onZoneUpdate: (zoneId: string, updates: any) => void
) => {
  // Configure canvas for customer interaction
  canvas.selection = true;
  canvas.preserveObjectStacking = true;
  
  // Add event listeners for object modifications
  canvas.on('object:modified', (e) => {
    const target = e.target;
    if (target && target.get('customProps' as any)?.zoneId) {
      const customProps = target.get('customProps' as any);
      const bounds = target.getBoundingRect();
      
      onZoneUpdate(customProps.zoneId, {
        x: bounds.left,
        y: bounds.top,
        width: bounds.width,
        height: bounds.height,
        content: target.get('type') === 'textbox' ? target.get('text') : target.get('src'),
        type: target.get('type') === 'textbox' ? 'text' : 'image'
      });
    }
  });
};

export const loadPageBackground = async (
  canvas: FabricCanvas,
  templateId: string,
  pageNumber: number,
  pdfUrl?: string
): Promise<void> => {
  try {
    if (!pdfUrl) {
      console.warn('No PDF URL available for background rendering');
      return;
    }

    // Create a simple placeholder background
    canvas.setBackgroundColor('#f8f9fa', canvas.renderAll.bind(canvas));
    
    // In a real implementation, you could use PDF.js here to render the PDF page
    // For now, we'll add a placeholder indicating the PDF page
    const placeholderText = new FabricText(`PDF Page ${pageNumber}`, {
      left: canvas.width! / 2,
      top: canvas.height! / 2,
      fontSize: 24,
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
      fill: '#666',
      selectable: false,
      evented: false
    });
    
    canvas.add(placeholderText);
    canvas.renderAll();
    
  } catch (error) {
    console.error('Error rendering PDF background:', error);
    // Set a simple gray background as fallback
    canvas.setBackgroundColor('#f0f0f0', canvas.renderAll.bind(canvas));
  }
};

export const loadCustomizationZones = async (
  canvas: FabricCanvas,
  templateId: string,
  pageId: string,
  customizations: any[]
): Promise<void> => {
  try {
    // Clear existing customizable objects
    const objects = canvas.getObjects().filter(obj => 
      obj.get('customProps' as any)?.isCustomizable
    );
    objects.forEach(obj => canvas.remove(obj));

    // Add customization zones as editable objects
    customizations.forEach(customization => {
      if (customization.content) {
        if (customization.type === 'text') {
          const textObject = new FabricText(customization.content, {
            left: customization.x || 100,
            top: customization.y || 100,
            fontSize: 16,
            fill: '#000000',
            selectable: true,
            editable: true
          });
          
          textObject.set('customProps', {
            zoneId: customization.zoneId,
            isCustomizable: true
          });
          
          canvas.add(textObject);
        } else if (customization.type === 'image' && customization.content) {
          FabricImage.fromURL(customization.content).then(img => {
            img.set({
              left: customization.x || 100,
              top: customization.y || 100,
              scaleX: 0.5,
              scaleY: 0.5,
              selectable: true
            });
            
            img.set('customProps', {
              zoneId: customization.zoneId,
              isCustomizable: true
            });
            
            canvas.add(img);
            canvas.renderAll();
          });
        }
      }
    });

    canvas.renderAll();
  } catch (error) {
    console.error('Error loading customization zones:', error);
  }
};
