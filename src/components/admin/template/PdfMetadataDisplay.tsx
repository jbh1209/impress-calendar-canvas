
import React from "react";
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
    <div className="bg-green-50 border border-green-200 rounded p-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 min-w-0">
          <FileText className="h-2.5 w-2.5 text-green-600 flex-shrink-0" />
          <span className="text-2xs font-medium text-green-800">Vector PDF Loaded</span>
          <Badge variant="secondary" className="text-2xs px-1 py-0 h-3">
            {metadata.pageCount}p
          </Badge>
          <span className="text-2xs text-green-700">{formatFileSize(metadata.fileSize)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(templateData.original_pdf_url, '_blank')}
            className="h-4 text-2xs px-1"
          >
            <Download className="h-2 w-2 mr-0.5" />
            PDF
          </Button>
          <div className="flex items-center gap-0.5 text-2xs text-green-700">
            <Info className="h-2 w-2" />
            Vector
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfMetadataDisplay;
