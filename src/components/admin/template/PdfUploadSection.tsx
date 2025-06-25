
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText } from "lucide-react";

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

      toast.success(`PDF processed successfully! ${data.pagesCreated} pages ready for editing.`);
      
      if (onProcessingComplete) {
        onProcessingComplete();
      }
    } catch (error: any) {
      console.error("[PdfUploadSection] Upload error:", error);
      toast.error(error.message || "PDF processing failed. Please try again.");
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
    <Card>
      <CardContent className="p-4">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
            dragOver 
              ? "bg-blue-50 border-blue-300" 
              : "bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-gray-100"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          <FileText className="h-8 w-8 text-gray-400 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            Upload Vector PDF
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Drag and drop your PDF here, or click to select
          </p>
          
          <input
            type="file"
            accept="application/pdf"
            disabled={isUploading}
            onChange={handleFileSelected}
            ref={fileInputRef}
            className="hidden"
          />
          
          <Button
            disabled={isUploading}
            variant="outline"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
                Processing PDF...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Select PDF File
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PdfUploadSection;
