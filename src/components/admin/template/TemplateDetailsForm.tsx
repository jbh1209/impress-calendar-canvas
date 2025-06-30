
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BleedSettings {
  top: number;
  right: number;
  bottom: number;
  left: number;
  units: string;
}

interface Template {
  name: string;
  description: string;
  category: string;
  dimensions: string;
  is_active: boolean;
  bleed_settings: BleedSettings;
}

interface TemplateDetailsFormProps {
  template: Template;
  setTemplate: (template: Template) => void;
}

const TemplateDetailsForm: React.FC<TemplateDetailsFormProps> = ({
  template,
  setTemplate
}) => {
  return (
    <div className="space-y-6">
      {/* Template Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Template Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={template.name}
              onChange={(e) => setTemplate({ ...template, name: e.target.value })}
              placeholder="Enter template name"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={template.description}
              onChange={(e) => setTemplate({ ...template, description: e.target.value })}
              placeholder="Optional description"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={template.category}
              onValueChange={(value) => setTemplate({ ...template, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="calendar">Calendar</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="event">Event</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="dimensions">Dimensions</Label>
            <Input
              id="dimensions"
              value={template.dimensions}
              onChange={(e) => setTemplate({ ...template, dimensions: e.target.value })}
              placeholder="e.g., 210x297mm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bleed Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Bleed Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Top</Label>
              <Input
                type="number"
                value={template.bleed_settings.top}
                onChange={(e) => setTemplate({
                  ...template,
                  bleed_settings: { ...template.bleed_settings, top: parseFloat(e.target.value) || 0 }
                })}
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Right</Label>
              <Input
                type="number"
                value={template.bleed_settings.right}
                onChange={(e) => setTemplate({
                  ...template,
                  bleed_settings: { ...template.bleed_settings, right: parseFloat(e.target.value) || 0 }
                })}
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Bottom</Label>
              <Input
                type="number"
                value={template.bleed_settings.bottom}
                onChange={(e) => setTemplate({
                  ...template,
                  bleed_settings: { ...template.bleed_settings, bottom: parseFloat(e.target.value) || 0 }
                })}
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Left</Label>
              <Input
                type="number"
                value={template.bleed_settings.left}
                onChange={(e) => setTemplate({
                  ...template,
                  bleed_settings: { ...template.bleed_settings, left: parseFloat(e.target.value) || 0 }
                })}
                className="text-sm"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-xs">Units</Label>
            <Select
              value={template.bleed_settings.units}
              onValueChange={(value) => setTemplate({
                ...template,
                bleed_settings: { ...template.bleed_settings, units: value }
              })}
            >
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mm">mm</SelectItem>
                <SelectItem value="in">in</SelectItem>
                <SelectItem value="pt">pt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateDetailsForm;
