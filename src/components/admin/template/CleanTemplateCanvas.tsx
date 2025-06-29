
import React, { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Rect, Text as FabricText } from "fabric";
import { toast } from "sonner";
import { TemplatePage } from "@/services/types/templateTypes";
import TemplateCanvasToolbar from "./TemplateCanvasToolbar";
import TemplateCanvasArea from "./TemplateCanvasArea";
import TemplateCanvasPlaceholder from "./TemplateCanvasPlaceholder";
import { 
  getCanvasDimensions, 
  createPlaceholderBackground, 
  loadPreviewImage 
} from "./utils/canvasUtils";

interface CleanTemplateCanvasProps {
  activePage?: TemplatePage;
  templateId?: string;
  templateDimensions?: {
    width: number;
    height: number;
    units: string;
  };
}

const CleanTemplateCanvas: React.FC<CleanTemplateCanvasProps> = ({
  activePage,
  templateId,
  templateDimensions
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);

  const canvasDims = getCanvasDimensions(templateDimensions);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: canvasDims.width,
      height: canvasDims.height,
      backgroundColor: "#f8f9fa",
      selection: true,
      preserveObjectStacking: true,
    });

    setFabricCanvas(canvas);
    setCanvasReady(true);

    return () => {
      canvas.dispose();
    };
  }, [templateDimensions]);

  // Load page background when activePage changes
  useEffect(() => {
    if (!fabricCanvas || !activePage || !canvasReady) return;

    setIsLoading(true);
    fabricCanvas.clear();

    fabricCanvas.setWidth(canvasDims.width);
    fabricCanvas.setHeight(canvasDims.height);

    // Load the actual preview image if available
    if (activePage.preview_image_url) {
      console.log('Loading preview image:', activePage.preview_image_url);
      
      loadPreviewImage(fabricCanvas, activePage.preview_image_url, canvasDims)
        .then(() => {
          setIsLoading(false);
          toast.success(`Page ${activePage.page_number} loaded successfully`);
        })
        .catch((error) => {
          console.error('Error loading preview image:', error);
          // Fallback to placeholder if image fails to load
          createPlaceholderBackground(fabricCanvas, canvasDims.width, canvasDims.height, activePage, templateDimensions);
          setIsLoading(false);
        });
    } else {
      // No preview image available, show placeholder
      createPlaceholderBackground(fabricCanvas, canvasDims.width, canvasDims.height, activePage, templateDimensions);
      setIsLoading(false);
    }
  }, [fabricCanvas, activePage, canvasReady, templateDimensions]);

  const addImageZone = () => {
    if (!fabricCanvas) return;

    const zone = new Rect({
      left: 100,
      top: 150,
      width: 200,
      height: 150,
      fill: 'rgba(59, 130, 246, 0.1)',
      stroke: '#3b82f6',
      strokeWidth: 2,
      strokeDashArray: [5, 5],
    });

    const label = new FabricText('Image Zone', {
      left: 200,
      top: 225,
      fontSize: 14,
      fill: '#3b82f6',
      fontFamily: 'Inter, system-ui, sans-serif',
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
    });

    fabricCanvas.add(zone);
    fabricCanvas.add(label);
    fabricCanvas.setActiveObject(zone);
    fabricCanvas.renderAll();

    toast.success('Image zone added');
  };

  const addTextZone = () => {
    if (!fabricCanvas) return;

    const zone = new Rect({
      left: 350,
      top: 200,
      width: 300,
      height: 50,
      fill: 'rgba(16, 185, 129, 0.1)',
      stroke: '#10b981',
      strokeWidth: 2,
      strokeDashArray: [5, 5],
    });

    const label = new FabricText('Text Zone', {
      left: 500,
      top: 225,
      fontSize: 14,
      fill: '#10b981',
      fontFamily: 'Inter, system-ui, sans-serif',
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
    });

    fabricCanvas.add(zone);
    fabricCanvas.add(label);
    fabricCanvas.setActiveObject(zone);
    fabricCanvas.renderAll();

    toast.success('Text zone added');
  };

  if (!activePage) {
    return <TemplateCanvasPlaceholder templateDimensions={templateDimensions} />;
  }

  return (
    <div className="space-y-4">
      <TemplateCanvasToolbar
        onAddImageZone={addImageZone}
        onAddTextZone={addTextZone}
        templateDimensions={templateDimensions}
      />
      
      <TemplateCanvasArea
        canvasRef={canvasRef}
        canvasDimensions={canvasDims}
        isLoading={isLoading}
        templateDimensions={templateDimensions}
      />
    </div>
  );
};

export default CleanTemplateCanvas;
