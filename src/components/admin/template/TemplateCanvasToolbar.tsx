
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Square, Type } from "lucide-react";

interface TemplateCanvasToolbarProps {
  onAddImageZone: () => void;
  onAddTextZone: () => void;
  templateDimensions?: {
    width: number;
    height: number;
    units: string;
  };
}

const TemplateCanvasToolbar: React.FC<TemplateCanvasToolbarProps> = ({
  onAddImageZone,
  onAddTextZone,
  templateDimensions
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Zones
          {templateDimensions && (
            <span className="text-xs text-gray-500 ml-2">
              ({templateDimensions.width} × {templateDimensions.height} {templateDimensions.units})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onAddImageZone}
            className="flex items-center gap-2"
          >
            <Square className="h-3 w-3" />
            Image Zone
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onAddTextZone}
            className="flex items-center gap-2"
          >
            <Type className="h-3 w-3" />
            Text Zone
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateCanvasToolbar;
