
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PdfUploadSectionProps {
  templateId: string;
  onProcessingComplete?: () => void;
}

const PdfUploadSection: React.FC<PdfUploadSectionProps> = ({
  templateId,
  onProcessingComplete
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
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
    if (!file || !templateId) return;
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("template_id", templateId);

      // Use fetch and track progress
      const req = new XMLHttpRequest();
      req.open("POST", "/functions/v1/split-pdf");
      req.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      req.onload = () => {
        setIsUploading(false);
        setUploadProgress(null);
        if (req.status >= 200 && req.status < 300) {
          const response = JSON.parse(req.responseText);
          toast.success(`PDF processed! ${response.pagesCreated} pages ready for zone editing.`);
          if (onProcessingComplete) onProcessingComplete();
        } else {
          try {
            const { error } = JSON.parse(req.responseText);
            toast.error(error || "An error occurred during PDF processing.");
          } catch {
            toast.error("An error occurred during PDF upload.");
          }
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
      };

      req.onerror = () => {
        setIsUploading(false);
        setUploadProgress(null);
        toast.error("An error occurred while uploading the PDF.");
        if (fileInputRef.current) fileInputRef.current.value = "";
      };

      req.send(formData);
    } catch (error: any) {
      toast.error(error.message || "An error occurred during PDF processing.");
      setIsUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
      className={`border border-gray-200 rounded p-6 mb-8 flex flex-col items-start gap-3 transition-colors ${
        dragOver ? "bg-blue-50 border-blue-300" : "bg-white"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      tabIndex={0}  // for accessibility
    >
      <label className="font-semibold mb-1 text-sm">
        Upload Vector PDF Template
      </label>
      <input
        type="file"
        accept="application/pdf"
        disabled={isUploading}
        onChange={handleFileSelected}
        ref={fileInputRef}
        className="hidden"
      />
      <Button
        size="sm"
        onClick={handleButtonClick}
        disabled={isUploading}
        className="mt-1"
      >
        {isUploading
          ? uploadProgress !== null
            ? `Processing (${uploadProgress}%)...`
            : "Processing..."
          : "Select Vector PDF"}
      </Button>
      <div className="text-xs text-muted-foreground mt-2">
        <div className="space-y-1">
          <p>📄 Upload your PDF template to preserve vector quality for print-ready output.</p>
          <p>🎯 Each page will become editable with customizable zones for user content.</p>
          <p>✨ Original vector format maintained for crisp text and graphics.</p>
          <span className="text-blue-600">You may also drag and drop a PDF here.</span>
        </div>
      </div>
    </div>
  );
};

export default PdfUploadSection;
