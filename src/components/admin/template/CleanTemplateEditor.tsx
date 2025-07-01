
import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import TemplateEditorHeader from "./TemplateEditorHeader";
import TemplateDetailsForm from "./TemplateDetailsForm";
import PdfUploadManager from "./PdfUploadManager";
import PrintProductionCanvas from "./PrintProductionCanvas";
import { useTemplateData } from "@/hooks/admin/template/useTemplateData";
import type { Dimensions } from "@/utils/coordinateSystem";

// Helper function to parse dimensions string like "8.5x11in" or "210x297mm"
const parseDimensions = (dimensionsStr: string): Dimensions | null => {
  if (!dimensionsStr) return null;
  
  const match = dimensionsStr.match(/^([0-9.]+)x([0-9.]+)(in|mm|pt)$/);
  if (match) {
    return {
      width: parseFloat(match[1]),
      height: parseFloat(match[2]),
      unit: match[3] as 'in' | 'mm' | 'pt'
    };
  }
  return null;
};

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
      
      // Load pages and then set the current page index
      await loadPages(templateId);
      setCurrentPageIndex(0);
      
    } catch (error) {
      console.error("PDF upload error:", error);
      toast.error('Failed to process PDF');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  // Parse template dimensions for the canvas
  const templateDimensions = parseDimensions(template.dimensions);

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
          <PrintProductionCanvas
            activePage={currentPage}
            templateId={template.id}
            templateDimensions={templateDimensions}
            originalPdfUrl={template.original_pdf_url}
          />
        </div>
      </div>
    </div>
  );
};

export default CleanTemplateEditor;
