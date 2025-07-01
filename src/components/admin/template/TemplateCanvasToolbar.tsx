
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Image, Type, Save, Download } from "lucide-react";

interface TemplateCanvasToolbarProps {
  onAddImageZone: () => void;
  onAddTextZone: () => void;
  templateDimensions?: {
    width: number;
    height: number;
    unit: string;
  };
}

const TemplateCanvasToolbar: React.FC<TemplateCanvasToolbarProps> = ({
  onAddImageZone,
  onAddTextZone,
  templateDimensions
}) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button onClick={onAddImageZone} size="sm" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Add Image Zone
            </Button>
            <Button onClick={onAddTextZone} size="sm" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Add Text Zone
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            {templateDimensions && (
              <div className="text-sm text-gray-600">
                Template: {templateDimensions.width} × {templateDimensions.height} {templateDimensions.unit}
              </div>
            )}
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Zones
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateCanvasToolbar;
