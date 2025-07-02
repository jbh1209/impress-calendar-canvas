import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TemplateState } from './types/templateTypes';

interface TemplateInfoFormProps {
  template: TemplateState;
  onTemplateChange: (template: TemplateState) => void;
}

const TemplateInfoForm: React.FC<TemplateInfoFormProps> = ({
  template,
  onTemplateChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Template Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={template.name}
            onChange={(e) => onTemplateChange({ ...template, name: e.target.value })}
            placeholder="Template name"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={template.description}
            onChange={(e) => onTemplateChange({ ...template, description: e.target.value })}
            placeholder="Template description"
          />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select 
            value={template.category} 
            onValueChange={(value) => onTemplateChange({ ...template, category: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Corporate">Corporate</SelectItem>
              <SelectItem value="Creative">Creative</SelectItem>
              <SelectItem value="Minimal">Minimal</SelectItem>
              <SelectItem value="Vintage">Vintage</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="dimensions">Dimensions</Label>
          <Input
            id="dimensions"
            value={template.dimensions}
            onChange={(e) => onTemplateChange({ ...template, dimensions: e.target.value })}
            placeholder="210x297"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateInfoForm;