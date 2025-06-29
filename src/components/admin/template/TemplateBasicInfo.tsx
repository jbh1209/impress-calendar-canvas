
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface TemplateFormData {
  name: string;
  description: string;
  category: string;
  is_active: boolean;
}

interface TemplateBasicInfoProps {
  formData: TemplateFormData;
  onUpdate: (updates: Partial<TemplateFormData>) => void;
}

const CATEGORIES = [
  { label: "Calendar", value: "calendar" },
  { label: "Poster", value: "poster" },
  { label: "Flyer", value: "flyer" },
  { label: "Business Card", value: "business-card" }
];

const TemplateBasicInfo: React.FC<TemplateBasicInfoProps> = ({
  formData,
  onUpdate
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Template Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-sm font-medium">
            Name *
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="Enter template name"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="description" className="text-sm font-medium">
            Description
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Enter template description"
            rows={3}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="category" className="text-sm font-medium">
            Category
          </Label>
          <Select
            value={formData.category}
            onValueChange={(value) => onUpdate({ category: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="active" className="text-sm font-medium">
            Active Template
          </Label>
          <Switch
            id="active"
            checked={formData.is_active}
            onCheckedChange={(checked) => onUpdate({ is_active: checked })}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateBasicInfo;
