
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

  const handleButtonClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const uploadPdfFile = async (file: File) => {
    if (!file || !templateId) {
      console.error("Missing file or template ID");
      return;
    }
    
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("template_id", templateId);

      const { data, error } = await supabase.functions.invoke('split-pdf', {
        body: formData,
      });

      if (error) {
        console.error("[PdfUploadSection] Error from split-pdf:", error);
        throw error;
      }

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

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadPdfFile(file);
  };

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
      className={`border-2 border-dashed rounded-md p-3 flex flex-col items-center gap-2 transition-all ${
        dragOver ? "bg-blue-50 border-blue-300" : "bg-gray-50 border-gray-200 hover:border-gray-300"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      tabIndex={0}
    >
      <div className="text-center">
        <div className="text-2xl mb-1">📄</div>
        <h3 className="font-medium text-gray-900 mb-1 text-sm">
          Upload Vector PDF Template
        </h3>
        <p className="text-xs text-gray-600 mb-2 max-w-sm leading-tight">
          Upload your PDF template to preserve vector quality. Each page will become editable.
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
        className="px-4 h-7 text-xs"
      >
        {isUploading ? (
          <>
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
            Processing...
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
