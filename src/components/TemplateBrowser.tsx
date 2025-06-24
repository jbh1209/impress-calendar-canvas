
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Template } from "@/services/types/templateTypes";
import { getAllTemplates } from "@/services/templateService";
import { Eye, Palette } from "lucide-react";

const TemplateBrowser: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const activeTemplates = await getAllTemplates();
        setTemplates(activeTemplates.filter(t => t.is_active));
      } catch (error) {
        console.error("Error loading templates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, []);

  const handleCustomizeTemplate = (templateId: string) => {
    navigate(`/customize/${templateId}`);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-gray-600">Loading templates...</div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your Calendar Template
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse our collection of professionally designed calendar templates. 
            Click "Customize" to personalize any design with your own photos and text.
          </p>
        </div>

        {templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-[4/3] bg-gray-100 relative">
                  {template.base_image_url ? (
                    <img
                      src={template.base_image_url}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Eye className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary">{template.category}</Badge>
                  </div>
                </div>
                
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  {template.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {template.description}
                    </p>
                  )}
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {template.dimensions || "Standard size"}
                    </div>
                    <Button 
                      onClick={() => handleCustomizeTemplate(template.id)}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Palette className="h-4 w-4" />
                      Customize
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">No templates available yet</div>
            <p className="text-sm text-gray-400">
              Templates will appear here once they've been created and published.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateBrowser;
