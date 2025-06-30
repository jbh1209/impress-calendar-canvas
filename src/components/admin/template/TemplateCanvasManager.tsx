
import React, { useEffect, useRef } from "react";
import { Canvas as FabricCanvas } from "fabric";
import { Card, CardContent } from "@/components/ui/card";
import { TemplatePage } from "@/services/types/templateTypes";

interface TemplateCanvasManagerProps {
  currentPage?: TemplatePage;
  templateDimensions?: string;
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
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Fabric.js canvas
    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff'
    });

    fabricCanvasRef.current = canvas;

    // Load current page if available
    if (currentPage) {
      loadPageContent(canvas, currentPage);
    }

    return () => {
      canvas.dispose();
    };
  }, [currentPage]);

  const loadPageContent = (canvas: FabricCanvas, page: TemplatePage) => {
    canvas.clear();
    canvas.backgroundColor = '#f8f9fa';
    canvas.renderAll();
    
    // Add placeholder content indicating this is a PDF page
    const { FabricText } = require("fabric");
    const pageText = new FabricText(`Page ${page.page_number}`, {
      left: canvas.width! / 2,
      top: canvas.height! / 2,
      fontSize: 32,
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
      fill: '#333',
      selectable: false
    });
    
    canvas.add(pageText);
    
    if (page.pdf_page_width && page.pdf_page_height) {
      const dimensionText = new FabricText(
        `${Math.round(page.pdf_page_width)} × ${Math.round(page.pdf_page_height)} pt`,
        {
          left: canvas.width! / 2,
          top: (canvas.height! / 2) + 50,
          fontSize: 16,
          textAlign: 'center',
          originX: 'center',
          originY: 'center',
          fill: '#666',
          selectable: false
        }
      );
      canvas.add(dimensionText);
    }
    
    canvas.renderAll();
  };

  if (!currentPage) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
            <div className="text-center">
              <div className="text-gray-500 mb-2">No page selected</div>
              <div className="text-sm text-gray-400">Upload a PDF to start editing</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="relative">
          <div className="border-2 border-gray-200 rounded-lg bg-white overflow-hidden flex justify-center">
            <canvas 
              ref={canvasRef} 
              className="max-w-full"
            />
          </div>
          
          {isProcessing && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <div className="text-sm text-gray-600">{processingStatus}</div>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 text-center">
          <div className="text-sm text-gray-600">
            Page {currentPage.page_number}
            {currentPage.pdf_page_width && currentPage.pdf_page_height && (
              <span className="ml-2">
                ({Math.round(currentPage.pdf_page_width)} × {Math.round(currentPage.pdf_page_height)} pt)
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Template dimensions: {templateDimensions || 'Not specified'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateCanvasManager;
