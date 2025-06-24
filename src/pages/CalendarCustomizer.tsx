
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Canvas as FabricCanvas } from "fabric";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { getTemplateById } from "@/services/templateService";
import { getTemplatePages } from "@/services/templatePageService";
import { Template, TemplatePage } from "@/services/types/templateTypes";
import CustomerCanvas from "@/components/customer/CustomerCanvas";
import CustomerZoneEditor from "@/components/customer/CustomerZoneEditor";
import CustomerPageNavigator from "@/components/customer/CustomerPageNavigator";
import CustomerOrderSummary from "@/components/customer/CustomerOrderSummary";
import CustomerToolbar from "@/components/customer/CustomerToolbar";

const CalendarCustomizer: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  
  const [template, setTemplate] = useState<Template | null>(null);
  const [pages, setPages] = useState<TemplatePage[]>([]);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [customizations, setCustomizations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const activePage = pages[activePageIndex];

  useEffect(() => {
    if (!templateId) {
      toast.error("Invalid template ID");
      navigate('/');
      return;
    }

    loadTemplateData();
  }, [templateId, navigate]);

  const loadTemplateData = async () => {
    if (!templateId) return;
    
    setIsLoading(true);
    try {
      // Load template details
      const templateData = await getTemplateById(templateId);
      if (!templateData) {
        toast.error("Template not found");
        navigate('/');
        return;
      }

      if (!templateData.is_active) {
        toast.error("This template is not available for customization");
        navigate('/');
        return;
      }

      setTemplate(templateData);

      // Load template pages
      const templatePages = await getTemplatePages(templateId);
      setPages(templatePages || []);
      
      // Initialize customizations array
      const initialCustomizations = (templatePages || []).map(page => ({
        pageId: page.id,
        zones: []
      }));
      setCustomizations(initialCustomizations);

    } catch (error) {
      console.error("Error loading template data:", error);
      toast.error("Failed to load template");
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleZoneUpdate = (pageId: string, zoneId: string, updates: any) => {
    setCustomizations(prev => {
      const newCustomizations = prev.map(customization => {
        if (customization.pageId === pageId) {
          const updatedZones = customization.zones.map((zone: any) => 
            zone.zoneId === zoneId ? { ...zone, ...updates } : zone
          );
          
          // Add zone if it doesn't exist
          if (!updatedZones.find((zone: any) => zone.zoneId === zoneId)) {
            updatedZones.push({ zoneId, ...updates });
          }
          
          return { ...customization, zones: updatedZones };
        }
        return customization;
      });
      
      setHasUnsavedChanges(true);
      return newCustomizations;
    });
  };

  const handleSaveChanges = () => {
    // In a real implementation, this would save to localStorage or send to server
    console.log("Saving customizations:", customizations);
    setHasUnsavedChanges(false);
    toast.success("Changes saved!");
  };

  const handleResetChanges = () => {
    const resetCustomizations = pages.map(page => ({
      pageId: page.id,
      zones: []
    }));
    setCustomizations(resetCustomizations);
    setHasUnsavedChanges(false);
    toast.success("Customizations reset!");
  };

  const handlePreview = () => {
    // Show preview modal or navigate to preview page
    toast.info("Preview feature coming soon!");
  };

  const getTotalCustomizations = () => {
    return customizations.reduce((total, page) => total + page.zones.length, 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-700 mb-2">Loading Calendar Editor...</div>
          <div className="text-sm text-gray-500">Preparing your customization workspace</div>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-lg font-medium text-gray-700 mb-2">Template Not Found</div>
            <div className="text-sm text-gray-500 mb-4">The requested template could not be loaded.</div>
            <button 
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back to Templates
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Toolbar */}
        <CustomerToolbar
          templateName={template.name}
          totalCustomizations={getTotalCustomizations()}
          onPreview={handlePreview}
          onSave={handleSaveChanges}
          onReset={handleResetChanges}
          hasUnsavedChanges={hasUnsavedChanges}
        />

        {/* Page Navigation */}
        {pages.length > 1 && (
          <div className="mb-4">
            <CustomerPageNavigator
              pages={pages}
              activePageIndex={activePageIndex}
              setActivePageIndex={setActivePageIndex}
            />
          </div>
        )}

        {/* Main Editor Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Canvas Area */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <CustomerCanvas
                  template={template}
                  activePage={activePage}
                  customizations={customizations.find(c => c.pageId === activePage?.id)?.zones || []}
                  onZoneUpdate={(zoneId, updates) => 
                    activePage && handleZoneUpdate(activePage.id, zoneId, updates)
                  }
                  fabricCanvasRef={fabricCanvasRef}
                />
              </CardContent>
            </Card>
          </div>

          {/* Zone Editor */}
          <div className="lg:col-span-1">
            <CustomerZoneEditor
              activePage={activePage}
              customizations={customizations.find(c => c.pageId === activePage?.id)?.zones || []}
              onZoneUpdate={(zoneId, updates) => 
                activePage && handleZoneUpdate(activePage.id, zoneId, updates)
              }
              fabricCanvasRef={fabricCanvasRef}
            />
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <CustomerOrderSummary
              template={template}
              customizations={customizations}
              totalZones={getTotalCustomizations()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarCustomizer;
