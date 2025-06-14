
import React, { useState } from "react";
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

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !templateId) return;
    setIsUploading(true);

    try {
      // Create form data for upload
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("template_id", templateId);

      // Call the edge function to split & process the pdf
      const res = await fetch("/functions/v1/split-pdf", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        throw new Error("Failed to process PDF.");
      }

      // Optionally: check response JSON for details
      toast.success("PDF uploaded! Pages are being processed.");
      if (onProcessingComplete) onProcessingComplete();
    } catch (error: any) {
      toast.error(error.message || "An error occurred.");
    } finally {
      setIsUploading(false);
      // Reset the input for re-upload
      e.target.value = "";
    }
  };

  return (
    <div className="border border-gray-200 rounded p-6 mb-8 flex flex-col items-start gap-3">
      <label className="font-semibold mb-1 text-sm">Upload New PDF Template</label>
      <input
        type="file"
        accept="application/pdf"
        disabled={isUploading}
        onChange={handleFileSelected}
        className="block rounded border p-1 mb-2"
      />
      <Button size="sm" disabled>
        {isUploading ? "Uploading..." : "Select PDF"}
      </Button>
      <div className="text-xs text-muted-foreground mt-2">
        (Each page will appear in the page navigator after upload)
      </div>
    </div>
  );
};

export default PdfUploadSection;
