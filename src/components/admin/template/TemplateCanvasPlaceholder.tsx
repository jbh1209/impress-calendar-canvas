
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface TemplateCanvasPlaceholderProps {
  templateDimensions?: {
    width: number;
    height: number;
    units: string;
  };
}

const TemplateCanvasPlaceholder: React.FC<TemplateCanvasPlaceholderProps> = ({
  templateDimensions
}) => {
  return (
    <Card className="w-full h-96">
      <CardContent className="h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p className="text-lg font-medium">No page selected</p>
          <p className="text-sm">Upload a PDF to get started</p>
          {templateDimensions && (
            <p className="text-xs mt-2 text-gray-400">
              Template: {templateDimensions.width} × {templateDimensions.height} {templateDimensions.units}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateCanvasPlaceholder;
