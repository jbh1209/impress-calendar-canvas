
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Upload, FileText, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { saveTemplate, getTemplateById } from "@/services/templateService";
import { getTemplatePages } from "@/services/templatePageService";
import { uploadPdfAndCreatePages } from "@/utils/pdfUpload";
import type { Template, TemplatePage } from "@/services/types/templateTypes";
import PdfUploader from "./PdfUploader";
import CleanTemplateCanvas from "./CleanTemplateCanvas";

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

const DIMENSION_PRESETS = [
  { label: "Letter (8.5 x 11 in)", value: "letter", width: "8.5", height: "11", units: "in" },
  { label: "A4 (210 x 297 mm)", value: "a4", width: "210", height: "297", units: "mm" },
  { label: "Square (12 x 12 in)", value: "square", width: "12", height: "12", units: "in" },
  { label: "Poster (18 x 24 in)", value: "poster", width: "18", height: "24", units: "in" },
  { label: "Custom", value: "custom", width: "", height: "", units: "in" }
];

const CATEGORIES = [
  { label: "Calendar", value: "calendar" },
  { label: "Poster", value: "poster" },
  { label: "Flyer", value: "flyer" },
  { label: "Business Card", value: "business-card" }
];

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
      const isCustomDimension = !DIMENSION_PRESETS.find(p => 
        p.value !== 'custom' && 
        `${p.width}x${p.height}${p.units}` === templateData.dimensions
      );
      
      setFormData({
        name: templateData.name,
        description: templateData.description || '',
        category: templateData.category,
        dimensions: isCustomDimension ? 'custom' : (DIMENSION_PRESETS.find(p => 
          `${p.width}x${p.height}${p.units}` === templateData.dimensions
        )?.value || 'custom'),
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

  const handlePresetChange = (presetValue: string) => {
    const preset = DIMENSION_PRESETS.find(p => p.value === presetValue);
    if (preset) {
      setFormData(prev => ({
        ...prev,
        dimensions: presetValue,
        customWidth: preset.width,
        customHeight: preset.height,
        units: preset.units,
        bleedUnits: preset.units
      }));
    }
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
            {/* Template Details */}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
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
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Dimensions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  Dimensions & Size
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Choose a preset size or enter custom dimensions</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Size Preset</Label>
                  <Select
                    value={formData.dimensions}
                    onValueChange={handlePresetChange}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIMENSION_PRESETS.map(preset => (
                        <SelectItem key={preset.value} value={preset.value}>
                          {preset.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Always show dimension inputs for better UX */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Dimensions</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs text-gray-500">Width</Label>
                      <Input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={formData.customWidth}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          customWidth: e.target.value,
                          dimensions: 'custom' 
                        }))}
                        placeholder="8.5"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Height</Label>
                      <Input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={formData.customHeight}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          customHeight: e.target.value,
                          dimensions: 'custom'
                        }))}
                        placeholder="11"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Units</Label>
                      <Select
                        value={formData.units}
                        onValueChange={(value) => setFormData(prev => ({ 
                          ...prev, 
                          units: value,
                          bleedUnits: value,
                          dimensions: 'custom'
                        }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in">in</SelectItem>
                          <SelectItem value="mm">mm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Dimension Preview */}
                  <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    Current: {getDimensionsString() || 'Not set'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bleed Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  Bleed Settings
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Extra area beyond page edges for printing. Standard is 0.125 inches.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <Label className="text-xs">Top</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.001"
                      value={formData.bleedTop}
                      onChange={(e) => setFormData(prev => ({ ...prev, bleedTop: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Right</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.001"
                      value={formData.bleedRight}
                      onChange={(e) => setFormData(prev => ({ ...prev, bleedRight: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Bottom</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.001"
                      value={formData.bleedBottom}
                      onChange={(e) => setFormData(prev => ({ ...prev, bleedBottom: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Left</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.001"
                      value={formData.bleedLeft}
                      onChange={(e) => setFormData(prev => ({ ...prev, bleedLeft: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Bleed Units</Label>
                  <Select
                    value={formData.bleedUnits}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, bleedUnits: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in">inches</SelectItem>
                      <SelectItem value="mm">millimeters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* PDF Upload - Only show after template is saved */}
            {template?.id && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload PDF Template
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PdfUploader
                    templateId={template.id}
                    onUploadComplete={handlePdfUploadComplete}
                  />
                </CardContent>
              </Card>
            )}

            {/* Pages List */}
            {pages.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Pages ({pages.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {pages.map((page, index) => (
                      <button
                        key={page.id}
                        onClick={() => setActivePageIndex(index)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          index === activePageIndex
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        Page {page.page_number}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
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
