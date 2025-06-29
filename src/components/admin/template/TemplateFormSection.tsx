
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UITemplateState {
  name: string;
  description: string;
  category: string;
  dimensions: string;
  is_active: boolean;
}

interface TemplateFormSectionProps {
  template: UITemplateState;
  setTemplate: React.Dispatch<React.SetStateAction<UITemplateState>>;
}

const TemplateFormSection: React.FC<TemplateFormSectionProps> = ({
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            value={template.name}
            onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter template name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={template.description}
            onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter template description"
            rows={3}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={template.category}
            onChange={(e) => setTemplate(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="calendar">Calendar</option>
            <option value="poster">Poster</option>
            <option value="flyer">Flyer</option>
            <option value="business-card">Business Card</option>
          </select>
        </div>

        {template.dimensions && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dimensions
            </label>
            <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
              {template.dimensions}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TemplateFormSection;
