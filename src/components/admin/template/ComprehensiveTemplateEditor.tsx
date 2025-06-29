
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import { saveTemplate, getTemplateById } from "@/services/templateService";
import { getTemplatePages } from "@/services/templatePageService";
import type { Template, TemplatePage } from "@/services/types/templateTypes";
import PdfUploader from "./PdfUploader";
import CleanTemplateCanvas from "./CleanTemplateCanvas";
import TemplateBasicInfo from "./TemplateBasicInfo";
import TemplateDimensions from "./TemplateDimensions";
import TemplateBleedSettings from "./TemplateBleedSettings";
import TemplatePages from "./TemplatePages";

interface TemplateFormData {
  name: string;
  description: string;
  category: string;
  dimensions: string;
  customWidth: string;
  customHeight: string;
  units: string;
  bleedTop: string;
  bleedRight: string;
  bleedBottom: string;
  bleedLeft: string;
  bleedUnits: string;
  is_active: boolean;
}

// Helper function to parse dimensions string like "8.5x11in" or "210x297mm"
const parseDimensions = (dimensionsStr: string) => {
  if (!dimensionsStr) return null;
  
  const match = dimensionsStr.match(/^([0-9.]+)x([0-9.]+)(in|mm)$/);
  if (match) {
    return {
      width: match[1],
      height: match[2],
      units: match[3]
    };
  }
  return null;
};

const ComprehensiveTemplateEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isCreateMode = !id;

  const [template, setTemplate] = useState<Template | null>(null);
  const [pages, setPages] = useState<TemplatePage[]>([]);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(!isCreateMode);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    description: '',
    category: 'calendar',
    dimensions: 'letter',
    customWidth: '8.5',
    customHeight: '11',
    units: 'in',
    bleedTop: '0.125',
    bleedRight: '0.125',
    bleedBottom: '0.125',
    bleedLeft: '0.125',
    bleedUnits: 'in',
    is_active: true
  });

  const activePage = pages[activePageIndex];

  // Load template for edit mode
  useEffect(() => {
    if (!isCreateMode && id) {
      loadTemplate(id);
    }
  }, [id, isCreateMode]);

  const loadTemplate = async (templateId: string) => {
    try {
      setIsLoading(true);
      
      const templateData = await getTemplateById(templateId);
      if (!templateData) {
        toast.error('Template not found');
        navigate('/admin/templates');
        return;
      }
      
      setTemplate(templateData);
      
      // Parse existing dimensions
      const parsedDims = parseDimensions(templateData.dimensions || '');
      const DIMENSION_PRESETS = [
        { label: "Letter (8.5 x 11 in)", value: "letter", width: "8.5", height: "11", units: "in" },
        { label: "A4 (210 x 297 mm)", value: "a4", width: "210", height: "297", units: "mm" },
        { label: "Square (12 x 12 in)", value: "square", width: "12", height: "12", units: "in" },
        { label: "Poster (18 x 24 in)", value: "poster", width: "18", height: "24", units: "in" }
      ];
      
      const matchingPreset = DIMENSION_PRESETS.find(p => 
        `${p.width}x${p.height}${p.units}` === templateData.dimensions
      );
      
      setFormData({
        name: templateData.name,
        description: templateData.description || '',
        category: templateData.category,
        dimensions: matchingPreset?.value || 'custom',
        customWidth: parsedDims?.width || '8.5',
        customHeight: parsedDims?.height || '11',
        units: parsedDims?.units || 'in',
        bleedTop: '0.125',
        bleedRight: '0.125',
        bleedBottom: '0.125',
        bleedLeft: '0.125',
        bleedUnits: parsedDims?.units || 'in',
        is_active: templateData.is_active
      });

      const pagesData = await getTemplatePages(templateId);
      setPages(pagesData);
      setActivePageIndex(0);

    } catch (error) {
      console.error('Error loading template:', error);
      toast.error('Failed to load template');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (updates: Partial<TemplateFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const getDimensionsString = () => {
    if (!formData.customWidth || !formData.customHeight) return '';
    return `${formData.customWidth}x${formData.customHeight}${formData.units}`;
  };

  const getCurrentDimensions = () => {
    return {
      width: parseFloat(formData.customWidth) || 8.5,
      height: parseFloat(formData.customHeight) || 11,
      units: formData.units
    };
  };

  const handleSaveTemplate = async () => {
    if (!formData.name.trim()) {
      toast.error('Template name is required');
      return;
    }

    if (!formData.customWidth || !formData.customHeight) {
      toast.error('Please specify template dimensions');
      return;
    }

    const dimensionsString = getDimensionsString();
    if (!dimensionsString) {
      toast.error('Please specify valid template dimensions');
      return;
    }

    setIsSaving(true);
    try {
      const templateToSave = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        isActive: formData.is_active,
        dimensions: dimensionsString,
        id: isCreateMode ? undefined : template?.id,
      };

      const savedTemplate = await saveTemplate(templateToSave);
      if (savedTemplate) {
        setTemplate(savedTemplate);
        toast.success('Template saved successfully');
        
        if (isCreateMode) {
          navigate(`/admin/templates/edit/${savedTemplate.id}`);
        }
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePdfUploadComplete = async () => {
    if (!template?.id) return;
    
    try {
      const updatedPages = await getTemplatePages(template.id);
      setPages(updatedPages);
      setActivePageIndex(0);
      toast.success('PDF processed successfully');
    } catch (error) {
      console.error('Error reloading pages:', error);
      toast.error('Failed to reload pages');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading template editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/admin/templates')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">
              {isCreateMode ? 'Create Template' : 'Edit Template'}
            </h1>
          </div>
          
          <Button
            onClick={handleSaveTemplate}
            disabled={isSaving || !formData.name.trim()}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Settings Panel */}
        <div className="w-96 bg-white border-r border-gray-200 h-screen overflow-y-auto">
          <div className="p-6 space-y-6">
            <TemplateBasicInfo
              formData={formData}
              onUpdate={updateFormData}
            />

            <TemplateDimensions
              formData={formData}
              onUpdate={updateFormData}
            />

            <TemplateBleedSettings
              formData={formData}
              onUpdate={updateFormData}
            />

            <Separator />

            {/* PDF Upload - Only show after template is saved */}
            {template?.id && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Upload className="h-4 w-4" />
                    <h3 className="font-medium">Upload PDF Template</h3>
                  </div>
                  <PdfUploader
                    templateId={template.id}
                    onUploadComplete={handlePdfUploadComplete}
                  />
                </CardContent>
              </Card>
            )}

            <TemplatePages
              pages={pages}
              activePageIndex={activePageIndex}
              onPageSelect={setActivePageIndex}
            />
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 p-6">
          {!template?.id ? (
            <Card className="h-96">
              <CardContent className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Ready to Create Template
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Fill in the template details above and save to continue
                  </p>
                  <p className="text-xs text-gray-500">
                    Current dimensions: {getDimensionsString() || 'Not set'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : pages.length === 0 ? (
            <Card className="h-96">
              <CardContent className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-4">📤</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Upload PDF Template
                  </h3>
                  <p className="text-sm text-gray-600">
                    Upload a PDF file to start creating customizable zones
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <CleanTemplateCanvas
              activePage={activePage}
              templateId={template?.id}
              templateDimensions={getCurrentDimensions()}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveTemplateEditor;
