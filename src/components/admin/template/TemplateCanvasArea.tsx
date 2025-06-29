
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { TemplatePage } from "@/services/types/templateTypes";

interface TemplateCanvasAreaProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  pages: TemplatePage[];
  currentPage?: TemplatePage;
}

const TemplateCanvasArea: React.FC<TemplateCanvasAreaProps> = ({
  canvasRef,
  pages,
  currentPage
}) => {
  return (
    <div className="flex-1 p-6">
      <Card>
        <CardContent className="p-4">
          <div className="border-2 border-gray-200 rounded-lg bg-white overflow-hidden relative">
            <canvas ref={canvasRef} className="max-w-full" />
            
            {pages.length === 0 && (
              <div className="absolute inset-4 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-4xl mb-4">📄</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Upload PDF Template
                  </h3>
                  <p className="text-sm text-gray-600">
                    Upload a PDF file to start creating customizable zones
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {currentPage && (
            <div className="mt-4 text-sm text-gray-600 text-center">
              Page {currentPage.page_number} • {currentPage.pdf_page_width} × {currentPage.pdf_page_height} pt
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateCanvasArea;
