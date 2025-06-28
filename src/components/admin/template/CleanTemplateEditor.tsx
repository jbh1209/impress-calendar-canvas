import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, FileText } from "lucide-react";
import { toast } from "sonner";
import { getTemplateById, saveTemplate } from "@/services/templateService";
import { getTemplatePages } from "@/services/templatePageService";
import { Template, TemplatePage } from "@/services/types/templateTypes";
import PdfUploader from "./PdfUploader";
import CleanTemplateCanvas from "./CleanTemplateCanvas";

const CleanTemplateEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [template, setTemplate] = useState<Template | null>(null);
  const [pages, setPages] = useState<TemplatePage[]>([]);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const isCreateMode = !id;
  const activePage = pages[activePageIndex];

  // Load template and pages
  useEffect(() => {
    const loadTemplate = async () => {
      if (isCreateMode) {
        // Create mode - initialize empty template
        setTemplate({
          id: '',
          name: '',
          description: '',
          category: '',
          is_active: true,
          base_image_url: null,
          dimensions: '',
          created_at: new Date().toISOString(),
        });
        setIsLoading(false);
        return;
      }

      if (!id) return;

      try {
        setIsLoading(true);
        
        // Load template
        const templateData = await getTemplateById(id);
        if (!templateData) {
          toast.error('Template not found');
          navigate('/admin/templates');
          return;
        }
        setTemplate(templateData);

        // Load pages
        const pagesData = await getTemplatePages(id);
        setPages(pagesData);
        setActivePageIndex(0);

      } catch (error) {
        console.error('Error loading template:', error);
        toast.error('Failed to load template');
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplate();
  }, [id, isCreateMode, navigate]);

  const handleSaveTemplate = async () => {
    if (!template) return;

    setIsSaving(true);
    try {
      // Transform to the format expected by saveTemplate
      const templateToSave = {
        name: template.name,
        description: template.description,
        category: template.category,
        isActive: template.is_active,
        dimensions: template.dimensions,
        id: isCreateMode ? undefined : template.id,
      };

      const savedTemplate = await saveTemplate(templateToSave);
      if (savedTemplate) {
        // Update local state with the full template data
        setTemplate({
          ...savedTemplate,
          is_active: savedTemplate.isActive || false,
        });
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
    
    // Reload pages after upload
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
            disabled={isSaving || !template?.name}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 p-6 space-y-6">
          {/* Template Details */}
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
                  value={template?.name || ''}
                  onChange={(e) => setTemplate(prev => prev ? {...prev, name: e.target.value} : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter template name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={template?.category || ''}
                  onChange={(e) => setTemplate(prev => prev ? {...prev, category: e.target.value} : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category</option>
                  <option value="calendar">Calendar</option>
                  <option value="poster">Poster</option>
                  <option value="flyer">Flyer</option>
                  <option value="business-card">Business Card</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dimensions
                </label>
                <input
                  type="text"
                  value={template?.dimensions || ''}
                  onChange={(e) => setTemplate(prev => prev ? {...prev, dimensions: e.target.value} : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., A4, 8.5x11in"
                />
              </div>
            </CardContent>
          </Card>

          {/* PDF Upload */}
          {template?.id && (
            <PdfUploader
              templateId={template.id}
              onUploadComplete={handlePdfUploadComplete}
            />
          )}

          {/* Pages List */}
          {pages.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
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

        {/* Main Canvas Area */}
        <div className="flex-1 p-6">
          {isCreateMode && !template?.id ? (
            <Card className="h-96">
              <CardContent className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-4">📄</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Ready to Create
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Fill in the template details and save to get started
                  </p>
                  <Button
                    onClick={handleSaveTemplate}
                    disabled={!template?.name || isSaving}
                  >
                    Create Template
                  </Button>
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
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CleanTemplateEditor;
