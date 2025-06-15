import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Canvas as FabricCanvas } from "fabric";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import TemplateCanvas from "@/components/admin/template/TemplateCanvas";
import TemplateSettings from "@/components/admin/template/TemplateSettings";
import { CustomizationZone } from "@/services/types/templateTypes";
import TemplatePageNavigator from "@/components/admin/template/TemplatePageNavigator";
import PdfUploadSection from "@/components/admin/template/PdfUploadSection";
import { useTemplateEditor } from "@/hooks/admin/template/useTemplateEditor";
import { saveTemplate } from "@/services/templateService";
import { getTemplatePages } from "@/services/templatePageService";

// Load pages when editing an existing template
// (Pages cannot exist for draft templates)
// FIX: Use useEffect, not useState, for side-effects
import { useEffect } from "react";

const TemplateEditor = () => {
  const { id } = useParams<{ id: string }>();
  const {
    mode,
    isLoading,
    setIsLoading,
    templateId,
    setTemplateId,
    template,
    setTemplate,
    templateData,
    errorMsg,
    setErrorMsg
  } = useTemplateEditor(id || null);

  const navigate = useNavigate();
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);

  const [pages, setPages] = useState([]);
  const [activePageIndex, setActivePageIndex] = useState(0);

  // Use useEffect for side-effects
  useEffect(() => {
    if (mode === "edit" && templateId) {
      setIsLoading(true);
      getTemplatePages(templateId)
        .then(results => setPages(results))
        .finally(() => setIsLoading(false));
    }
  }, [templateId, mode]);

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

  // Validate fields before save
  const validateTemplate = () => {
    if (!template.name?.trim()) return "Template name is required.";
    if (!template.dimensions?.trim()) return "Dimensions are required.";
    if (!template.category?.trim()) return "Category is required.";
    // Add more as needed
    return null;
  };

  // Save/create template to DB only on explicit action
  const handleSaveTemplate = async () => {
    const validationError = validateTemplate();
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setIsLoading(true);

    // Always send the latest from the form
    const templateToSave = {
      ...(mode === "edit" && templateId ? { id: templateId } : {}),
      name: template.name,
      description: template.description,
      category: template.category,
      is_active: template.isActive,
      dimensions: template.dimensions,
      // Only allow editing of base_image_url in "edit" mode for now
      base_image_url: templateData?.base_image_url,
      customization_zones: getZonesFromCanvas(),
    };

    try {
      const savedTemplate = await saveTemplate(templateToSave);
      if (savedTemplate) {
        toast.success(mode === "edit" ? "Template updated successfully" : "Template created successfully");
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

  // Warn and go back for errors in Edit mode
  if (errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="mb-4 text-red-600 font-semibold text-lg">{errorMsg}</div>
        <Button variant="outline" onClick={() => navigate("/admin/templates")}>
          Back to Template List
        </Button>
      </div>
    );
  }

  // Readable, clean UI
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
          <BreadcrumbPage>{mode === "edit" ? "Edit Template" : "Create Template"}</BreadcrumbPage>
        </BreadcrumbItem>
      </Breadcrumb>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/admin/templates")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">{mode === "edit" ? "Edit Template" : "Create Template"}</h1>
        </div>
        <Button onClick={handleSaveTemplate} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          Save Template
        </Button>
      </div>

      {/* Only offer PDF upload in edit mode, after a template is created */}
      {mode === "edit" && templateId && (
        <PdfUploadSection
          templateId={templateId}
          onProcessingComplete={async () => {
            setIsLoading(true);
            const results = await getTemplatePages(templateId);
            setPages(results);
            setIsLoading(false);
          }}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* If pages exist in edit mode, show navigator/canvas. Else show helper */}
          {mode === "edit" && pages.length > 0 ? (
            <Card className="mb-6">
              <CardContent className="p-6">
                <TemplatePageNavigator
                  pages={pages}
                  activePageIndex={activePageIndex}
                  setActivePageIndex={setActivePageIndex}
                />
                <TemplateCanvas
                  isEditing={true}
                  templateId={templateId}
                  templateData={templateData}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  fabricCanvasRef={fabricCanvasRef}
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-6">
              <CardContent className="p-16 text-center">
                <div className="text-lg text-gray-700 mb-2 font-medium">
                  {mode === "edit"
                    ? "No pages yet"
                    : "Set template details and save to start"}
                </div>
                <div className="text-gray-500 mb-4">
                  {mode === "edit"
                    ? "Upload a PDF to generate pages."
                    : "Enter required info, then save to create your new template."}
                </div>
                <span role="img" aria-label="PDF">📄</span>
              </CardContent>
            </Card>
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
