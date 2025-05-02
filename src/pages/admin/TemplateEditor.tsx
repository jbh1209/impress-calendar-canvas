
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import TemplateCanvas from "@/components/admin/template/TemplateCanvas";
import TemplateSettings from "@/components/admin/template/TemplateSettings";
import { getTemplateById } from "@/services/templateService";

const TemplateEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = id !== undefined;
  const [isLoading, setIsLoading] = useState(true);
  const [templateData, setTemplateData] = useState<any>(null);
  
  const [template, setTemplate] = useState({
    name: "",
    description: "",
    category: "",
    isActive: false,
    dimensions: "11x8.5"
  });

  useEffect(() => {
    if (isEditing && id) {
      // Load template data
      const data = getTemplateById(parseInt(id));
      if (data) {
        setTemplateData(data);
        setTemplate({
          name: data.name,
          description: data.description,
          category: data.category,
          isActive: data.isActive,
          dimensions: data.dimensions
        });
      } else {
        toast.error("Template not found");
        navigate("/admin/templates");
      }
    }
  }, [id, isEditing, navigate]);
  
  const handleSaveTemplate = () => {
    // In a real implementation, this would save the template data to Supabase
    toast.success(isEditing ? "Template updated successfully" : "Template created successfully");
    navigate("/admin/templates");
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
        <Button onClick={handleSaveTemplate}>
          <Save className="mr-2 h-4 w-4" />
          Save Template
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardContent className="p-6">
              <TemplateCanvas 
                isEditing={isEditing}
                templateId={id}
                templateData={templateData}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
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
