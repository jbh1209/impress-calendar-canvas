
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Save, Upload, ChevronDown, Info } from "lucide-react";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { saveTemplate } from "@/services/templateService";
import PdfUploadSection from "./PdfUploadSection";

interface TemplateToolbarProps {
  template: any;
  setTemplate: (template: any) => void;
  isLoading?: boolean;
  templateId?: string;
  setTemplateId?: (id: string) => void;
  onProcessingComplete?: () => void;
}

export default function TemplateToolbar({
  template,
  setTemplate,
  isLoading = false,
  templateId,
  setTemplateId,
  onProcessingComplete
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showBleedSettings, setShowBleedSettings] = useState(false);

  // Initialize with mm as default, use template units if available
  const currentUnits = template.units || 'mm';
  const bleed = template.bleed || { 
    top: 3, 
    right: 3, 
    bottom: 3, 
    left: 3, 
    units: currentUnits 
  };

  const handleSave = async () => {
    if (!template.name?.trim()) {
      toast.error("Template name is required");
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveTemplate({ ...template, id: templateId });
      if (result && !templateId && setTemplateId) {
        setTemplateId(result.id);
      }
      toast.success("Template saved successfully");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBleedChange = (side: string, value: string) => {
    const numValue = Math.max(0, parseFloat(value) || 0);
    const newBleed = { ...bleed, [side]: numValue };
    setTemplate({ ...template, bleed: newBleed });
  };

  const handleBleedUnitChange = (unit: string) => {
    const newBleed = { ...bleed, units: unit };
    setTemplate({ ...template, bleed: newBleed });
  };

  const handleUnitsChange = (newUnits: string) => {
    // Update both template units and bleed units immediately
    const updatedBleed = { ...bleed, units: newUnits };
    const updatedTemplate = { 
      ...template, 
      units: newUnits,
      bleed: updatedBleed 
    };
    setTemplate(updatedTemplate);
    console.log("[TemplateToolbar] Units changed to:", newUnits, "Template updated:", updatedTemplate);
  };

  return (
    <div className="bg-white border-b border-gray-200 p-6">
      <div className="max-w-full space-y-4">
        {/* Top Row - Name and Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <Input
              placeholder="Template Name"
              value={template.name || ""}
              onChange={(e) => setTemplate({ ...template, name: e.target.value })}
              className="text-lg font-medium"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowUpload(!showUpload)}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload PDF
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Template"}
            </Button>
          </div>
        </div>

        {/* Second Row - Description */}
        <div>
          <Textarea
            placeholder="Template description..."
            value={template.description || ""}
            onChange={(e) => setTemplate({ ...template, description: e.target.value })}
            className="resize-none"
            rows={2}
          />
        </div>

        {/* Third Row - Settings */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={template.category || "calendar"}
              onValueChange={(value) => setTemplate({ ...template, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="calendar">Calendar</SelectItem>
                <SelectItem value="poster">Poster</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="brochure">Brochure</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Dimensions</Label>
            <Input
              placeholder="e.g., 297x210 mm"
              value={template.dimensions || ""}
              onChange={(e) => setTemplate({ ...template, dimensions: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Units</Label>
            <Select
              value={currentUnits}
              onValueChange={handleUnitsChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mm">Millimeters</SelectItem>
                <SelectItem value="in">Inches</SelectItem>
                <SelectItem value="pt">Points</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={template.is_active || false}
              onCheckedChange={(checked) => setTemplate({ ...template, is_active: checked })}
            />
            <Label>Active</Label>
            {template.is_active && <Badge variant="default">Published</Badge>}
          </div>
        </div>

        {/* Bleed Settings - Collapsible */}
        <Collapsible open={showBleedSettings} onOpenChange={setShowBleedSettings}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center gap-2">
                <span>Bleed Settings</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Bleed is extra area beyond page edges for backgrounds/images that extend to paper edge. Standard is 3mm.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
              {["top", "right", "bottom", "left"].map(side => (
                <div key={side} className="space-y-1">
                  <Label className="text-sm capitalize">{side}</Label>
                  <Input
                    type="number"
                    value={bleed[side] || 0}
                    min={0}
                    step={0.1}
                    onChange={(e) => handleBleedChange(side, e.target.value)}
                    className="text-sm"
                  />
                </div>
              ))}
              <div className="space-y-1">
                <Label className="text-sm">Units</Label>
                <Select value={bleed.units || currentUnits} onValueChange={handleBleedUnitChange}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mm">Millimeters</SelectItem>
                    <SelectItem value="in">Inches</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* PDF Upload Section */}
        {showUpload && templateId && (
          <div className="pt-4 border-t">
            <PdfUploadSection
              templateId={templateId}
              onProcessingComplete={onProcessingComplete}
            />
          </div>
        )}
      </div>
    </div>
  );
}
