
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Loader2 } from "lucide-react";
import type { TemplatePage } from "@/services/types/templateTypes";

interface PdfUploadSectionProps {
  isProcessingPdf: boolean;
  processingStatus: string;
  pages: TemplatePage[];
  currentPageIndex: number;
  setCurrentPageIndex: (index: number) => void;
  onPdfUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const PdfUploadSection: React.FC<PdfUploadSectionProps> = ({
  isProcessingPdf,
  processingStatus,
  pages,
  currentPageIndex,
  setCurrentPageIndex,
  onPdfUpload
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">PDF Template</CardTitle>
      </CardHeader>
      <CardContent>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={onPdfUpload}
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="w-full"
          disabled={isProcessingPdf}
        >
          {isProcessingPdf ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          {isProcessingPdf ? 'Processing...' : 'Upload PDF'}
        </Button>
        
        {isProcessingPdf && processingStatus && (
          <div className="mt-2 text-xs text-gray-600 text-center">
            {processingStatus}
          </div>
        )}
        
        {pages.length > 0 && (
          <div className="mt-4">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Pages ({pages.length})
            </div>
            <div className="grid grid-cols-4 gap-2">
              {pages.map((page, index) => (
                <button
                  key={page.id}
                  onClick={() => setCurrentPageIndex(index)}
                  className={`aspect-[3/4] border-2 rounded text-xs flex items-center justify-center transition-colors ${
                    index === currentPageIndex
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {page.page_number}
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PdfUploadSection;
