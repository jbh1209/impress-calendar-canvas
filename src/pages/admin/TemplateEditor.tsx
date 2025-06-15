
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

const DEFAULT_TEMPLATE = {
  name: "Untitled Template",
  description: "",
  category: "Corporate",
  isActive: false,
  dimensions: "11x8.5",
};

const TemplateEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = id !== undefined;
  const [isLoading, setIsLoading] = useState(true);
  const [templateId, setTemplateId] = useState<string | null>(id || null);
  const [templateData, setTemplateData] = useState<any>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);

  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);

  const [pages, setPages] = useState<TemplatePage[]>([]);
  const [activePageIndex, setActivePageIndex] = useState(0);

  // 1. Auto-create draft for create flow (no id in params)
  useEffect(() => {
    const initOrLoadTemplate = async () => {
      setIsLoading(true);
      if (id) {
        // Editing flow
        const data = await getTemplateById(id);
        if (!data) {
          toast.error("Template not found");
          navigate("/admin/templates");
          return;
        }
        setTemplateData(data);
        setTemplate({
          name: data.name,
          description: data.description || "",
          category: data.category,
          isActive: data.is_active,
          dimensions: data.dimensions || "11x8.5",
        });
        setTemplateId(data.id);
        setIsLoading(false);
      } else {
        // Creating flow: immediately create draft template
        try {
          // DOUBLE SAFEGUARD: avoid calling saveTemplate if not authenticated
          const saved = await saveTemplate({ ...DEFAULT_TEMPLATE });
          if (!saved) throw new Error("Could not create draft template. Ensure you are logged in.");
          setTemplateData(saved);
          setTemplate({
            name: saved.name || DEFAULT_TEMPLATE.name,
            description: saved.description || "",
            category: saved.category || DEFAULT_TEMPLATE.category,
            isActive: saved.is_active,
            dimensions: saved.dimensions || DEFAULT_TEMPLATE.dimensions,
          });
          setTemplateId(saved.id);
        } catch (e: any) {
          toast.error("Could not create draft template: " + (e?.message || ""));
          navigate("/admin/templates");
        } finally {
          setIsLoading(false);
        }
      }
    };
    initOrLoadTemplate();
    // eslint-disable-next-line
  }, [id]);

  // 2. Load template pages when templateId is available
  useEffect(() => {
    if (!templateId) {
      setPages([]);
      setActivePageIndex(0);
      return;
    }
    const loadPages = async () => {
      setIsLoading(true);
      const results = await getTemplatePages(templateId);
      setPages(results);
      setIsLoading(false);
      setActivePageIndex(0);
    };
    loadPages();
  }, [templateId]);

  const getZonesFromCanvas = (): CustomizationZone[] => {
    if (!fabricCanvasRef.current) return [];
    const canvasObjects = fabricCanvasRef.current.getObjects();
    const zones: CustomizationZone[] = canvasObjects.map((obj, index) => {
      const customProps = obj.get('customProps' as any);
      const width = obj.width! * (obj.scaleX || 1);
      const height = obj.height! * (obj.scaleY || 1);
      return {
        id: customProps.zoneId,
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

  // Save template
  const handleSaveTemplate = async () => {
    setIsLoading(true);
    try {
      const currentZones = getZonesFromCanvas();
      const templateToSave = {
        id: templateId,
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
    if (templateId) {
      setIsLoading(true);
      const results = await getTemplatePages(templateId);
      setPages(results);
      setIsLoading(false);
    }
  };

  // UI for no pages yet
  const renderNoPages = () => (
    <Card className="mb-6">
      <CardContent className="p-16 text-center">
        <div className="text-lg text-gray-700 mb-2 font-medium">No pages yet</div>
        <div className="text-gray-500 mb-4">Upload a PDF to generate pages for your template.</div>
        <span role="img" aria-label="PDF">📄</span>
      </CardContent>
    </Card>
  );

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

      {/* 1. PDF Upload section — always render when templateId */}
      {templateId && (
        <PdfUploadSection
          templateId={templateId}
          onProcessingComplete={reloadPages}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* If pages exist, show navigator/canvas. Else show helper */}
          {pages.length > 0 ? (
            <Card className="mb-6">
              <CardContent className="p-6">
                <TemplatePageNavigator
                  pages={pages}
                  activePageIndex={activePageIndex}
                  setActivePageIndex={setActivePageIndex}
                />
                <TemplateCanvas
                  isEditing={!!templateId}
                  templateId={templateId}
                  templateData={templateData}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  fabricCanvasRef={fabricCanvasRef}
                />
              </CardContent>
            </Card>
          ) : (
            renderNoPages()
          )}
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
