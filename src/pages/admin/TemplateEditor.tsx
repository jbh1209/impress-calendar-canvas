import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Canvas as FabricCanvas } from "fabric";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import TemplateCanvas from "@/components/admin/template/TemplateCanvas";
import TemplateSettings from "@/components/admin/template/TemplateSettings";
import { getTemplateById, saveTemplate } from "@/services/templateService";
import { CustomizationZone } from "@/services/types/templateTypes";
import { getTemplatePages } from "@/services/templatePageService";
import TemplatePageNavigator from "@/components/admin/template/TemplatePageNavigator";
import { TemplatePage } from "@/services/types/templateTypes";
import PdfUploadSection from "@/components/admin/template/PdfUploadSection";

const TemplateEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = id !== undefined;
  const [isLoading, setIsLoading] = useState(true);
  const [templateData, setTemplateData] = useState<any>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  
  const [template, setTemplate] = useState({
    name: "",
    description: "",
    category: "Corporate",
    isActive: false,
    dimensions: "11x8.5"
  });

  // PAGE NAVIGATION STATE
  const [pages, setPages] = useState<TemplatePage[]>([]);
  const [activePageIndex, setActivePageIndex] = useState(0);

  useEffect(() => {
    const loadTemplate = async () => {
      if (isEditing && id) {
        try {
          const data = await getTemplateById(id);
          if (data) {
            setTemplateData(data);
            setTemplate({
              name: data.name,
              description: data.description || "",
              category: data.category,
              isActive: data.is_active,
              dimensions: data.dimensions || "11x8.5"
            });
            setIsLoading(false);
          } else {
            toast.error("Template not found");
            navigate("/admin/templates");
          }
        } catch (error) {
          console.error("Error loading template:", error);
          toast.error("Failed to load template");
          navigate("/admin/templates");
        }
      } else {
        setIsLoading(false);
      }
    };

    loadTemplate();
  }, [id, isEditing, navigate]);

  // Load pages for this template (when id changes)
  useEffect(() => {
    const loadPages = async () => {
      if (id) {
        setIsLoading(true);
        const results = await getTemplatePages(id);
        setPages(results);
        setIsLoading(false);
        // Always reset to page 0 on load
        setActivePageIndex(0);
      } else {
        setPages([]);
        setActivePageIndex(0);
      }
    };
    loadPages();
  }, [id]);

  const getZonesFromCanvas = (): CustomizationZone[] => {
    if (!fabricCanvasRef.current) return [];

    const canvasObjects = fabricCanvasRef.current.getObjects();
    const zones: CustomizationZone[] = canvasObjects.map((obj, index) => {
      const customProps = obj.get('customProps' as any);
      
      const width = obj.width! * (obj.scaleX || 1);
      const height = obj.height! * (obj.scaleY || 1);

      return {
        id: customProps.zoneId, // This is undefined for new zones
        name: customProps.name,
        type: customProps.zoneType,
        x: obj.left!,
        y: obj.top!,
        width: width,
        height: height,
        z_index: index,
      };
    });

    return zones;
  };
  
  const handleSaveTemplate = async () => {
    setIsLoading(true);
    
    try {
      const currentZones = getZonesFromCanvas();
      
      // Prepare template data
      const templateToSave = {
        id: isEditing ? id : undefined,
        name: template.name,
        description: template.description,
        category: template.category,
        is_active: template.isActive,
        dimensions: template.dimensions,
        base_image_url: templateData?.base_image_url,
        customization_zones: currentZones,
      };
      
      const savedTemplate = await saveTemplate(templateToSave);
      
      if (savedTemplate) {
        toast.success(isEditing ? "Template updated successfully" : "Template created successfully");
        navigate("/admin/templates");
      } else {
        toast.error("Failed to save template");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  // Refresh pages when PDF upload completes
  const reloadPages = async () => {
    if (id) {
      setIsLoading(true);
      const results = await getTemplatePages(id);
      setPages(results);
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <Breadcrumb className="mb-6">
        <BreadcrumbItem>
          <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/admin/templates">Templates</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{isEditing ? "Edit Template" : "Create Template"}</BreadcrumbPage>
        </BreadcrumbItem>
      </Breadcrumb>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/admin/templates")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">{isEditing ? "Edit Template" : "Create Template"}</h1>
        </div>
        <Button onClick={handleSaveTemplate} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          Save Template
        </Button>
      </div>

      {/* 1. PDF Upload section for new/existing template */}
      {id && (
        <PdfUploadSection
          templateId={id}
          onProcessingComplete={reloadPages}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardContent className="p-6">
              {pages.length > 0 && (
                <TemplatePageNavigator
                  pages={pages}
                  activePageIndex={activePageIndex}
                  setActivePageIndex={setActivePageIndex}
                />
              )}
              <TemplateCanvas 
                isEditing={isEditing}
                templateId={id}
                templateData={templateData}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                fabricCanvasRef={fabricCanvasRef}
                // TODO: pass activePage info as needed in next phase
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <TemplateSettings 
            template={template}
            setTemplate={setTemplate}
          />
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;
