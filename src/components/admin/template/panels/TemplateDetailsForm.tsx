
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

interface UITemplateState {
  name: string;
  description: string;
  category: string;
  dimensions: string;
  is_active: boolean;
  customWidth: number;
  customHeight: number;
  units: string;
}

interface TemplateDetailsFormProps {
  template: UITemplateState;
  setTemplate: React.Dispatch<React.SetStateAction<UITemplateState>>;
}

const TemplateDetailsForm: React.FC<TemplateDetailsFormProps> = ({
  template,
  setTemplate
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Template Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </Label>
          <Input
            type="text"
            value={template.name}
            onChange={(e) => setTemplate(prev => ({...prev, name: e.target.value}))}
            placeholder="Enter template name"
          />
        </div>
        
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </Label>
          <Select
            value={template.category}
            onValueChange={(value) => setTemplate(prev => ({...prev, category: value}))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="calendar">Calendar</SelectItem>
              <SelectItem value="poster">Poster</SelectItem>
              <SelectItem value="flyer">Flyer</SelectItem>
              <SelectItem value="business-card">Business Card</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </Label>
          <Textarea
            value={template.description}
            onChange={(e) => setTemplate(prev => ({...prev, description: e.target.value}))}
            rows={3}
            placeholder="Template description"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_active"
            checked={template.is_active}
            onCheckedChange={(checked) => setTemplate(prev => ({...prev, is_active: !!checked}))}
          />
          <Label htmlFor="is_active" className="text-sm font-medium text-gray-700">
            Active Template
          </Label>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateDetailsForm;
