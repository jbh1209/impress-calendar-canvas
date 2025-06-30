import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import TemplateEditorHeader from "./TemplateEditorHeader";
import TemplateDetailsForm from "./TemplateDetailsForm";
import PdfUploadManager from "./PdfUploadManager";
import TemplateCanvasManager from "./TemplateCanvasManager";
import { useTemplateData } from "@/hooks/admin/template/useTemplateData";

const CleanTemplateEditor: React.FC = () => {
  const {
    template,
    setTemplate,
    pages,
    setPages,
    currentPageIndex,
    setCurrentPageIndex,
    currentPage,
    isCreateMode,
    isLoading,
    saveTemplate,
    loadPages
  } = useTemplateData();

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!template.name.trim()) {
      toast.error("Please enter a template name first");
      return;
    }

    // Save template first if it doesn't exist
    let templateId = template.id;
    if (!templateId) {
      await saveTemplate();
      // Get the ID from the current template state after save
      const { data: savedTemplate } = await supabase
        .from('templates')
        .select('id')
        .eq('name', template.name)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (!savedTemplate) {
        toast.error("Failed to save template first");
        return;
      }
      templateId = savedTemplate.id;
    }

    setIsProcessing(true);
    setProcessingStatus('Uploading PDF...');

    try {
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("template_id", templateId);

      const { data, error } = await supabase.functions.invoke('split-pdf', {
        body: formData,
      });

      if (error) {
        console.error("Upload error:", error);
        toast.error(`Upload failed: ${error.message}`);
        return;
      }

      if (!data?.success) {
        toast.error(data?.message || 'PDF processing failed');
        return;
      }

      toast.success(data.message);
      await loadPages(templateId);
      
      // Ensure we have valid pages data with required properties
      if (data.pages && data.pages.length > 0) {
        // Transform the pages data to ensure it has all required properties
        const transformedPages = data.pages.map((page: any) => ({
          id: page.id,
          template_id: page.template_id,
          page_number: page.page_number,
          preview_image_url: page.preview_image_url || null,
          pdf_page_width: page.pdf_page_width || null,
          pdf_page_height: page.pdf_page_height || null,
          pdf_units: page.pdf_units || 'pt',
          created_at: page.created_at || new Date().toISOString(),
          updated_at: page.updated_at || new Date().toISOString()
        }));
        
        setPages(transformedPages);
        setCurrentPageIndex(0);
      }
    } catch (error) {
      console.error("PDF upload error:", error);
      toast.error('Failed to process PDF');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TemplateEditorHeader
        isCreateMode={isCreateMode}
        templateName={template.name}
        onSave={saveTemplate}
        isLoading={isLoading}
      />

      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 p-6 space-y-6">
          <TemplateDetailsForm
            template={template}
            setTemplate={setTemplate}
          />
          
          <PdfUploadManager
            onPdfUpload={handlePdfUpload}
            isProcessing={isProcessing}
            processingStatus={processingStatus}
            pages={pages}
            currentPageIndex={currentPageIndex}
            setCurrentPageIndex={setCurrentPageIndex}
          />
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 p-6">
          <TemplateCanvasManager
            currentPage={currentPage}
            templateDimensions={template.dimensions}
            isProcessing={isProcessing}
            processingStatus={processingStatus}
          />
        </div>
      </div>
    </div>
  );
};

export default CleanTemplateEditor;
