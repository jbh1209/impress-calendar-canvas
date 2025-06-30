
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TemplatePage } from "@/services/types/templateTypes";

interface TemplateCanvasAreaProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  pages?: TemplatePage[];
  currentPage?: TemplatePage;
  canvasDimensions?: {
    width: number;
    height: number;
  };
  isLoading?: boolean;
  templateDimensions?: {
    width: number;
    height: number;
    units: string;
  };
}

const TemplateCanvasArea: React.FC<TemplateCanvasAreaProps> = ({
  canvasRef,
  pages,
  currentPage,
  canvasDimensions = { width: 800, height: 600 },
  isLoading = false,
  templateDimensions
}) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="relative">
          <div className="border-2 border-gray-200 rounded-lg bg-white overflow-hidden flex justify-center">
            <canvas 
              ref={canvasRef} 
              className="max-w-full"
              style={{ 
                width: canvasDimensions.width,
                height: canvasDimensions.height
              }}
            />
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
        
        {/* Canvas Info */}
        <div className="mt-2 text-xs text-gray-500 text-center">
          Canvas: {canvasDimensions.width} × {canvasDimensions.height} px
          {templateDimensions && (
            <span className="ml-2">
              (Template: {templateDimensions.width} × {templateDimensions.height} {templateDimensions.units})
            </span>
          )}
          {currentPage && (
            <span className="ml-2">
              • Page {currentPage.page_number} of {pages?.length || 1}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateCanvasArea;
