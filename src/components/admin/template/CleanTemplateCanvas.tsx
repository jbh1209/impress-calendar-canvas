import React, { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Image as FabricImage, Rect, Text as FabricText } from "fabric";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TemplatePage } from "@/services/types/templateTypes";
import { Plus, Square, Type, FileText } from "lucide-react";

interface CleanTemplateCanvasProps {
  activePage?: TemplatePage;
  templateId?: string;
}

const CleanTemplateCanvas: React.FC<CleanTemplateCanvasProps> = ({
  activePage,
  templateId
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);

  // Helper function to create placeholder background
  const createPlaceholderBackground = (canvas: FabricCanvas, canvasWidth: number, canvasHeight: number, activePage: TemplatePage) => {
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

      setIsLoading(false);

    } catch (error) {
      console.error('Error creating placeholder:', error);
      setIsLoading(false);
      toast.error('Failed to load page');
    }
  };

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: "#f8f9fa",
      selection: true,
      preserveObjectStacking: true,
    });

    setFabricCanvas(canvas);
    setCanvasReady(true);

    return () => {
      canvas.dispose();
    };
  }, []);

  // Load page background when activePage changes
  useEffect(() => {
    if (!fabricCanvas || !activePage || !canvasReady) return;

    setIsLoading(true);
    fabricCanvas.clear();

    // Calculate canvas dimensions based on PDF page dimensions
    let canvasWidth = 800;
    let canvasHeight = 600;

    if (activePage.pdf_page_width && activePage.pdf_page_height) {
      const aspectRatio = activePage.pdf_page_width / activePage.pdf_page_height;
      const maxWidth = 1000;
      const maxHeight = 700;

      if (aspectRatio > 1) {
        canvasWidth = Math.min(maxWidth, activePage.pdf_page_width * 0.5);
        canvasHeight = canvasWidth / aspectRatio;
      } else {
        canvasHeight = Math.min(maxHeight, activePage.pdf_page_height * 0.5);
        canvasWidth = canvasHeight * aspectRatio;
      }
    }

    fabricCanvas.setWidth(canvasWidth);
    fabricCanvas.setHeight(canvasHeight);

    // Load the actual preview image if available
    if (activePage.preview_image_url) {
      console.log('Loading preview image:', activePage.preview_image_url);
      
      FabricImage.fromURL(activePage.preview_image_url)
        .then((img) => {
          // Scale image to fit canvas
          const imgScale = Math.min(
            canvasWidth / img.width!,
            canvasHeight / img.height!
          );
          
          img.set({
            left: 0,
            top: 0,
            scaleX: imgScale,
            scaleY: imgScale,
            selectable: false,
            evented: false,
          });

          fabricCanvas.add(img);
          fabricCanvas.sendObjectToBack(img);  // Fixed: use sendObjectToBack instead of bringObjectToBack
          fabricCanvas.renderAll();
          
          setIsLoading(false);
          toast.success(`Page ${activePage.page_number} loaded successfully`);
        })
        .catch((error) => {
          console.error('Error loading preview image:', error);
          // Fallback to placeholder if image fails to load
          createPlaceholderBackground(fabricCanvas, canvasWidth, canvasHeight, activePage);
        });
    } else {
      // No preview image available, show placeholder
      createPlaceholderBackground(fabricCanvas, canvasWidth, canvasHeight, activePage);
    }
  }, [fabricCanvas, activePage, canvasReady]);

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
    return (
      <Card className="w-full h-96">
        <CardContent className="h-full flex items-center justify-center">
          <div className="text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-lg font-medium">No page selected</p>
            <p className="text-sm">Upload a PDF to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Zone Tools */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Zones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={addImageZone}
              className="flex items-center gap-2"
            >
              <Square className="h-3 w-3" />
              Image Zone
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={addTextZone}
              className="flex items-center gap-2"
            >
              <Type className="h-3 w-3" />
              Text Zone
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Canvas */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <div className="border-2 border-gray-200 rounded-lg bg-white overflow-hidden">
              <canvas ref={canvasRef} className="max-w-full" />
            </div>
            
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <div className="text-sm text-gray-600">Loading page preview...</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CleanTemplateCanvas;
