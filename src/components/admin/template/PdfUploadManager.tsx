
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface TemplatePage {
  id: string;
  template_id: string;
  page_number: number;
  preview_image_url: string | null;
  pdf_page_width: number | null;
  pdf_page_height: number | null;
  pdf_units: string | null;
}

interface PdfUploadManagerProps {
  onPdfUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isProcessing: boolean;
  processingStatus: string;
  pages: TemplatePage[];
  currentPageIndex: number;
  setCurrentPageIndex: (index: number) => void;
}

const PdfUploadManager: React.FC<PdfUploadManagerProps> = ({
  onPdfUpload,
  isProcessing,
  processingStatus,
  pages,
  currentPageIndex,
  setCurrentPageIndex
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">PDF Upload</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="pdf-upload">Upload PDF</Label>
          <Input
            id="pdf-upload"
            type="file"
            accept=".pdf"
            onChange={onPdfUpload}
            disabled={isProcessing}
          />
        </div>
        
        {isProcessing && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            {processingStatus}
          </div>
        )}
        
        {pages.length > 0 && (
          <div>
            <Label className="text-xs">Pages ({pages.length})</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {pages.map((page, index) => (
                <Button
                  key={page.id}
                  variant={index === currentPageIndex ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPageIndex(index)}
                  className="text-xs"
                >
                  {page.page_number}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PdfUploadManager;
