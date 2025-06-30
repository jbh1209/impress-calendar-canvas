
import React, { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Rect, Text as FabricText } from "fabric";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface TemplatePage {
  id: string;
  template_id: string;
  page_number: number;
  preview_image_url: string | null;
  pdf_page_width: number | null;
  pdf_page_height: number | null;
  pdf_units: string | null;
}

interface TemplateCanvasManagerProps {
  currentPage?: TemplatePage;
  templateDimensions: string;
  isProcessing: boolean;
  processingStatus: string;
}

const TemplateCanvasManager: React.FC<TemplateCanvasManagerProps> = ({
  currentPage,
  templateDimensions,
  isProcessing,
  processingStatus
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: "#f8fafc",
      selection: true,
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  // Update canvas when page changes
  useEffect(() => {
    if (currentPage && fabricCanvas) {
      updateCanvas();
    }
  }, [currentPage, fabricCanvas]);

  const updateCanvas = () => {
    if (!fabricCanvas || !currentPage) return;

    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#f8fafc";

    if (currentPage.preview_image_url) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = fabricCanvas.getElement();
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Scale image to fit canvas
          const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * 0.9;
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const x = (canvas.width - scaledWidth) / 2;
          const y = (canvas.height - scaledHeight) / 2;
          
          ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
          fabricCanvas.renderAll();
        }
      };
      img.onerror = () => {
        console.error('Failed to load preview image');
        createPlaceholder();
      };
      img.src = currentPage.preview_image_url;
    } else {
      createPlaceholder();
    }
  };

  const createPlaceholder = () => {
    if (!fabricCanvas || !currentPage) return;

    const titleText = new FabricText(`Page ${currentPage.page_number}`, {
      left: 400,
      top: 250,
      fontSize: 32,
      fill: '#374151',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
    });

    const dimensionText = new FabricText(
      `${Math.round(currentPage.pdf_page_width || 0)} × ${Math.round(currentPage.pdf_page_height || 0)} ${currentPage.pdf_units || 'pt'}`,
      {
        left: 400,
        top: 300,
        fontSize: 18,
        fill: '#6b7280',
        fontFamily: 'Arial',
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
      }
    );

    fabricCanvas.add(titleText);
    fabricCanvas.add(dimensionText);
    fabricCanvas.renderAll();
  };

  const addTextZone = () => {
    if (!fabricCanvas) return;

    const zone = new Rect({
      left: 100,
      top: 100,
      width: 200,
      height: 50,
      fill: 'rgba(16, 185, 129, 0.1)',
      stroke: '#10b981',
      strokeWidth: 2,
      strokeDashArray: [5, 5],
    });

    const label = new FabricText('Text Zone', {
      left: 200,
      top: 125,
      fontSize: 14,
      fill: '#10b981',
      fontFamily: 'Arial',
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

  const addImageZone = () => {
    if (!fabricCanvas) return;

    const zone = new Rect({
      left: 350,
      top: 100,
      width: 150,
      height: 150,
      fill: 'rgba(59, 130, 246, 0.1)',
      stroke: '#3b82f6',
      strokeWidth: 2,
      strokeDashArray: [5, 5],
    });

    const label = new FabricText('Image Zone', {
      left: 425,
      top: 175,
      fontSize: 14,
      fill: '#3b82f6',
      fontFamily: 'Arial',
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

  return (
    <div className="space-y-4">
      {/* Zone Tools */}
      {currentPage && (
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Button onClick={addTextZone} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Text Zone
              </Button>
              <Button onClick={addImageZone} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Image Zone
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Canvas Area */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <div className="border-2 border-gray-200 rounded-lg bg-white overflow-hidden flex justify-center">
              <canvas 
                ref={canvasRef} 
                className="max-w-full"
                style={{ 
                  width: 800,
                  height: 600
                }}
              />
            </div>
            
            {isProcessing && (
              <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  <div className="text-sm text-gray-600">{processingStatus}</div>
                </div>
              </div>
            )}
          </div>
          
          {/* Canvas Info */}
          <div className="mt-2 text-xs text-gray-500 text-center">
            Canvas: 800 × 600 px • Template: {templateDimensions}
            {currentPage && (
              <span className="ml-2">
                • Page {currentPage.page_number}
                {currentPage.pdf_page_width && currentPage.pdf_page_height && (
                  <span className="ml-2">
                    ({Math.round(currentPage.pdf_page_width)} × {Math.round(currentPage.pdf_page_height)} {currentPage.pdf_units || 'pt'})
                  </span>
                )}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateCanvasManager;
