
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Loader2, FileText } from "lucide-react";
import type { TemplatePage } from "@/services/types/templateTypes";

interface TemplatePdfUploadPanelProps {
  isProcessingPdf: boolean;
  processingStatus: string;
  pages: TemplatePage[];
  currentPageIndex: number;
  setCurrentPageIndex: (index: number) => void;
  onPdfUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const TemplatePdfUploadPanel: React.FC<TemplatePdfUploadPanelProps> = ({
  isProcessingPdf,
  processingStatus,
  pages,
  currentPageIndex,
  setCurrentPageIndex,
  onPdfUpload
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      {/* PDF Upload */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">PDF Upload</CardTitle>
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
        </CardContent>
      </Card>

      {/* Pages */}
      {pages.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Pages ({pages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default TemplatePdfUploadPanel;
