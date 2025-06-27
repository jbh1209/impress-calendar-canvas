
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, Image } from "lucide-react";
import { generateAllPDFPreviews } from "@/utils/pdfPreviewGenerator";

interface PdfUploadSectionProps {
  templateId: string;
  onProcessingComplete?: () => void;
}

const PdfUploadSection: React.FC<PdfUploadSectionProps> = ({
  templateId,
  onProcessingComplete
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingPreviews, setIsGeneratingPreviews] = useState(false);
  const [previewProgress, setPreviewProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleButtonClick = () => {
    if (!isUploading && !isGeneratingPreviews) {
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
      // Step 1: Upload PDF and create page records
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

      toast.success(`PDF uploaded successfully! ${data.pagesCreated} pages created.`);
      
      setIsUploading(false);
      
      // Step 2: Generate preview images client-side
      if (data.success && data.pages && data.pdfUrl) {
        setIsGeneratingPreviews(true);
        toast.info("Generating preview images...");
        
        const previewResults = await generateAllPDFPreviews(
          data.pdfUrl,
          data.pages,
          templateId,
          (current, total) => {
            setPreviewProgress({ current, total });
          }
        );
        
        setIsGeneratingPreviews(false);
        
        if (previewResults.success > 0) {
          toast.success(`Successfully generated ${previewResults.success} preview images!`);
        }
        
        if (previewResults.failed > 0) {
          toast.error(`Failed to generate ${previewResults.failed} preview images`);
        }
      }
      
      if (onProcessingComplete) {
        onProcessingComplete();
      }
      
    } catch (error: any) {
      console.error("[PdfUploadSection] Upload error:", error);
      toast.error(error.message || "PDF processing failed. Please try again.");
    } finally {
      setIsUploading(false);
      setIsGeneratingPreviews(false);
      setPreviewProgress({ current: 0, total: 0 });
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

  const isProcessing = isUploading || isGeneratingPreviews;

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
            disabled={isProcessing}
            onChange={handleFileSelected}
            ref={fileInputRef}
            className="hidden"
          />
          
          <Button
            disabled={isProcessing}
            variant="outline"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
                Processing PDF...
              </>
            ) : isGeneratingPreviews ? (
              <>
                <Image className="h-4 w-4 mr-2" />
                Generating Previews ({previewProgress.current}/{previewProgress.total})
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
