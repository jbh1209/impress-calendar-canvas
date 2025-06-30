
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TemplatePage } from "@/services/types/templateTypes";

interface TemplateZoneToolsPanelProps {
  pages: TemplatePage[];
  onAddTextZone: () => void;
  onAddImageZone: () => void;
}

const TemplateZoneToolsPanel: React.FC<TemplateZoneToolsPanelProps> = ({
  pages,
  onAddTextZone,
  onAddImageZone
}) => {
  if (pages.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Add Zones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button onClick={onAddTextZone} variant="outline" className="w-full">
          Add Text Zone
        </Button>
        <Button onClick={onAddImageZone} variant="outline" className="w-full">
          Add Image Zone
        </Button>
      </CardContent>
    </Card>
  );
};

export default TemplateZoneToolsPanel;
