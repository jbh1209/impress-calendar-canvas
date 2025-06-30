
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { TemplatePage } from "@/services/types/templateTypes";

interface UITemplateState {
  name: string;
  description: string;
  category: string;
  dimensions: string;
  is_active: boolean;
  customWidth: number;
  customHeight: number;
  units: string;
}

interface TemplateCanvasAreaProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  template: UITemplateState;
  currentPage: TemplatePage | undefined;
  pages: TemplatePage[];
  isProcessingPdf: boolean;
}

const TemplateCanvasArea: React.FC<TemplateCanvasAreaProps> = ({
  canvasRef,
  template,
  currentPage,
  pages,
  isProcessingPdf
}) => {
  return (
    <div className="flex-1 p-6">
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
            
            {isProcessingPdf && (
              <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Processing PDF...</div>
                </div>
              </div>
            )}
          </div>
          
          {/* Canvas Info */}
          <div className="mt-2 text-xs text-gray-500 text-center">
            Canvas: 800 × 600 px • Template: {template.customWidth} × {template.customHeight} {template.units}
            {currentPage && (
              <span className="ml-2">
                • Page {currentPage.page_number} of {pages.length}
                {currentPage.pdf_page_width && currentPage.pdf_page_height && (
                  <span className="ml-2">
                    ({Math.round(currentPage.pdf_page_width)} × {Math.round(currentPage.pdf_page_height)} pt)
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

export default TemplateCanvasArea;
