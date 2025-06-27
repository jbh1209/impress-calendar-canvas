
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { uploadPdfAndCreatePages } from "@/utils/simplePdfUpload";

interface SimplePdfUploadProps {
  templateId: string;
  onComplete?: () => void;
}

const SimplePdfUpload: React.FC<SimplePdfUploadProps> = ({
  templateId,
  onComplete
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error("Please upload a PDF file");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("PDF file is too large. Maximum size is 50MB.");
      return;
    }

    setIsUploading(true);
    setUploadComplete(false);

    try {
      const result = await uploadPdfAndCreatePages(
        file,
        templateId,
        (status) => setUploadStatus(status)
      );

      if (result.success) {
        setUploadComplete(true);
        toast.success(result.message);
        if (onComplete) onComplete();
      } else {
        toast.error(result.message || "Upload failed");
      }
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const resetUpload = () => {
    setUploadComplete(false);
    setUploadStatus("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
            isUploading 
              ? "bg-gray-50 border-gray-200 cursor-not-allowed" 
              : "bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-gray-100 cursor-pointer"
          }`}
          onClick={handleButtonClick}
        >
          {!isUploading && !uploadComplete ? (
            <>
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                Upload PDF Template
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Click to select your PDF file
              </p>
              
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileSelected}
                ref={fileInputRef}
                className="hidden"
              />
              
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Select PDF File
              </Button>
            </>
          ) : isUploading ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-sm font-medium text-gray-900">
                {uploadStatus || "Processing PDF..."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <p className="text-sm font-medium text-green-600">
                PDF uploaded successfully!
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={resetUpload}
              >
                Upload Another PDF
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SimplePdfUpload;
