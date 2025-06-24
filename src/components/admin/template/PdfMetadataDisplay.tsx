
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <Card className="mb-6 bg-green-50 border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-green-800">
          <FileText className="h-5 w-5" />
          Vector PDF Loaded
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">Pages:</span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{metadata.pageCount}</Badge>
            </div>
          </div>
          <div>
            <span className="font-medium text-gray-600">File Size:</span>
            <div className="text-gray-800">{formatFileSize(metadata.fileSize)}</div>
          </div>
          <div>
            <span className="font-medium text-gray-600">Units:</span>
            <div className="text-gray-800">{metadata.units || 'pt'}</div>
          </div>
          <div>
            <span className="font-medium text-gray-600">Original File:</span>
            <div className="text-gray-800 truncate" title={metadata.originalFileName}>
              {metadata.originalFileName}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(templateData.original_pdf_url, '_blank')}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Original PDF
          </Button>
          <div className="flex items-center gap-1 text-xs text-green-700">
            <Info className="h-3 w-3" />
            Vector format preserved for print quality
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PdfMetadataDisplay;
