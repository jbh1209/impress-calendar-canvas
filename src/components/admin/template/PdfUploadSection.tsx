
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PdfUploadSectionProps {
  templateId: string;
  onProcessingComplete?: () => void;
}

const PdfUploadSection: React.FC<PdfUploadSectionProps> = ({
  templateId,
  onProcessingComplete
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  // Open file dialog on button click
  const handleButtonClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  // Main upload handler (file from input/dnd)
  const uploadPdfFile = async (file: File) => {
    if (!file || !templateId) {
      console.error("Missing file or template ID");
      return;
    }
    
    console.log("[PdfUploadSection] Starting upload for template:", templateId);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("template_id", templateId);

      console.log("[PdfUploadSection] Calling split-pdf function...");
      
      // Use Supabase client to call the edge function
      const { data, error } = await supabase.functions.invoke('split-pdf', {
        body: formData,
      });

      if (error) {
        console.error("[PdfUploadSection] Error from split-pdf:", error);
        throw error;
      }

      console.log("[PdfUploadSection] Success response:", data);
      toast.success(`PDF processed! ${data.pagesCreated} pages ready for zone editing.`);
      
      if (onProcessingComplete) {
        onProcessingComplete();
      }
    } catch (error: any) {
      console.error("[PdfUploadSection] Upload error:", error);
      toast.error(error.message || "An error occurred during PDF processing.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Input change handler
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadPdfFile(file);
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) uploadPdfFile(file);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 mb-4 flex flex-col items-center gap-3 transition-all ${
        dragOver ? "bg-blue-50 border-blue-300" : "bg-gray-50 border-gray-200 hover:border-gray-300"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      tabIndex={0}
    >
      <div className="text-center">
        <div className="text-4xl mb-2">📄</div>
        <h3 className="font-semibold text-gray-900 mb-1">
          Upload Vector PDF Template
        </h3>
        <p className="text-sm text-gray-600 mb-4 max-w-md">
          Upload your PDF template to preserve vector quality for print-ready output. 
          Each page will become editable with customizable zones.
        </p>
      </div>
      
      <input
        type="file"
        accept="application/pdf"
        disabled={isUploading}
        onChange={handleFileSelected}
        ref={fileInputRef}
        className="hidden"
      />
      
      <Button
        onClick={handleButtonClick}
        disabled={isUploading}
        className="px-6"
      >
        {isUploading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing PDF...
          </>
        ) : (
          "Select PDF File"
        )}
      </Button>
      
      <p className="text-xs text-gray-500 text-center">
        Or drag and drop a PDF file here
      </p>
    </div>
  );
};

export default PdfUploadSection;
