import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Edit, Upload, Eye, Trash2 } from "lucide-react";
import TemplatePdfUpload from "./TemplatePdfUpload";
import TemplateEditor from "./TemplateEditor";

interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string;
  is_active: boolean;
  original_pdf_url: string | null;
  pdf_metadata: any;
  created_at: string;
}

const TemplateList = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showUpload, setShowUpload] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState<string | null>(null);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const toggleTemplateStatus = async (template: Template) => {
    try {
      const { error } = await supabase
        .from('templates')
        .update({ is_active: !template.is_active })
        .eq('id', template.id);

      if (error) throw error;
      
      toast.success(`Template ${template.is_active ? 'deactivated' : 'activated'}`);
      fetchTemplates();
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error("Failed to update template");
    }
  };

  const deleteTemplate = async (template: Template) => {
    if (!confirm(`Are you sure you want to delete "${template.name}"?`)) return;
    
    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', template.id);

      if (error) throw error;
      
      toast.success("Template deleted");
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error("Failed to delete template");
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  if (showEditor) {
    return (
      <TemplateEditor
        templateId={showEditor}
        onBack={() => setShowEditor(null)}
      />
    );
  }

  if (showUpload) {
    return (
      <TemplatePdfUpload
        templateId={showUpload}
        onBack={() => setShowUpload(null)}
        onComplete={() => {
          setShowUpload(null);
          fetchTemplates();
        }}
      />
    );
  }

  if (loading) {
    return <div className="text-center py-8">Loading templates...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Templates ({templates.length})</h2>
      
      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No templates created yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    {template.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {template.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={template.is_active ? "default" : "secondary"}>
                      {template.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {template.original_pdf_url ? (
                      <span>
                        PDF uploaded • {template.pdf_metadata?.pageCount || 0} pages
                      </span>
                    ) : (
                      <span>No PDF uploaded</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!template.original_pdf_url ? (
                      <Button
                        size="sm"
                        onClick={() => setShowUpload(template.id)}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Upload PDF
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowEditor(template.id)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit Zones
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleTemplateStatus(template)}
                    >
                      {template.is_active ? "Deactivate" : "Activate"}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteTemplate(template)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplateList;