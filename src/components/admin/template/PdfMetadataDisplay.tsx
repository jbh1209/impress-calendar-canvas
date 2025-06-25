
import React from "react";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PdfMetadataDisplayProps {
  templateData: any;
  isVisible: boolean;
}

const PdfMetadataDisplay: React.FC<PdfMetadataDisplayProps> = ({ 
  templateData, 
  isVisible 
}) => {
  if (!isVisible || !templateData?.original_pdf_url || !templateData?.pdf_metadata) {
    return null;
  }

  const metadata = templateData.pdf_metadata;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-green-600" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-green-800">Vector PDF Loaded</span>
                <Badge variant="secondary">
                  {metadata.pageCount} pages
                </Badge>
              </div>
              <p className="text-xs text-green-700 mt-1">
                {formatFileSize(metadata.fileSize)} • Vector format
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(templateData.original_pdf_url, '_blank')}
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <div className="flex items-center gap-1 text-xs text-green-700">
              <Info className="h-3 w-3" />
              Vector Ready
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PdfMetadataDisplay;
