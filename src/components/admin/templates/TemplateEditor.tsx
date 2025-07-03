import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import TemplatePageEditor from "./TemplatePageEditor";
import TemplateZoneList from "./TemplateZoneList";

interface TemplateEditorProps {
  templateId: string;
  onBack: () => void;
}

interface Template {
  id: string;
  name: string;
  original_pdf_url: string | null;
}

interface TemplatePage {
  id: string;
  page_number: number;
  pdf_page_width: number;
  pdf_page_height: number;
  pdf_units: string;
}

const TemplateEditor = ({ templateId, onBack }: TemplateEditorProps) => {
  const [template, setTemplate] = useState<Template | null>(null);
  const [pages, setPages] = useState<TemplatePage[]>([]);
  const [selectedPage, setSelectedPage] = useState<TemplatePage | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTemplateData = async () => {
    setLoading(true);
    try {
      // Fetch template
      const { data: templateData, error: templateError } = await supabase
        .from('templates')
        .select('id, name, original_pdf_url')
        .eq('id', templateId)
        .single();

      if (templateError) throw templateError;
      setTemplate(templateData);

      // Fetch pages
      const { data: pagesData, error: pagesError } = await supabase
        .from('template_pages')
        .select('*')
        .eq('template_id', templateId)
        .order('page_number');

      if (pagesError) throw pagesError;
      setPages(pagesData || []);

      // Auto-select first page
      if (pagesData && pagesData.length > 0) {
        setSelectedPage(pagesData[0]);
      }

    } catch (error) {
      console.error('Error fetching template data:', error);
      toast.error("Failed to load template");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplateData();
  }, [templateId]);

  if (loading) {
    return <div className="text-center py-8">Loading template...</div>;
  }

  if (!template) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Template not found</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Templates
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Templates
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{template.name}</h2>
          <p className="text-muted-foreground">Define customization zones</p>
        </div>
      </div>

      {pages.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No pages found. Please upload a PDF first.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          {/* Page Navigation */}
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pages ({pages.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {pages.map((page) => (
                  <Button
                    key={page.id}
                    variant={selectedPage?.id === page.id ? "default" : "outline"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setSelectedPage(page)}
                  >
                    Page {page.page_number}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Zone List */}
            {selectedPage && (
              <div className="mt-4">
                <TemplateZoneList pageId={selectedPage.id} />
              </div>
            )}
          </div>

          {/* Page Editor */}
          <div className="col-span-9">
            {selectedPage && template.original_pdf_url ? (
              <TemplatePageEditor
                page={selectedPage}
                pdfUrl={template.original_pdf_url}
                templateId={templateId}
              />
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">Select a page to start editing</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateEditor;