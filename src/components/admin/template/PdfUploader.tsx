
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import { uploadPdfAndCreatePages } from "@/utils/pdfUpload";

interface PdfUploaderProps {
  templateId: string;
  onUploadComplete?: () => void;
}

const PdfUploader: React.FC<PdfUploaderProps> = ({
  templateId,
  onUploadComplete
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    pagesCreated?: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error("Please select a PDF file");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("PDF file is too large. Maximum size is 50MB.");
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      const result = await uploadPdfAndCreatePages(
        file,
        templateId,
        (status) => setUploadStatus(status)
      );

      setUploadResult(result);

      if (result.success) {
        toast.success(result.message);
        if (onUploadComplete) onUploadComplete();
      } else {
        toast.error(result.message || "Upload failed");
      }
    } catch (error) {
      toast.error("Upload failed");
      setUploadResult({
        success: false,
        message: "Upload failed"
      });
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setUploadResult(null);
    setUploadStatus("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Upload className="h-4 w-4" />
          PDF Upload
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!uploading && !uploadResult ? (
          <div className="space-y-4">
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Click to upload your PDF template
              </p>
              <p className="text-xs text-gray-500">
                Maximum file size: 50MB
              </p>
            </div>
            
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              ref={fileInputRef}
              className="hidden"
            />
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Select PDF File
            </Button>
          </div>
        ) : uploading ? (
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-sm text-gray-600">
              {uploadStatus || "Processing PDF..."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {uploadResult?.success ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-red-500" />
              )}
              <div>
                <p className={`text-sm font-medium ${
                  uploadResult?.success ? 'text-green-600' : 'text-red-600'
                }`}>
                  {uploadResult?.success ? 'Upload Successful!' : 'Upload Failed'}
                </p>
                <p className="text-xs text-gray-600">
                  {uploadResult?.message}
                </p>
                {uploadResult?.success && uploadResult?.pagesCreated && (
                  <p className="text-xs text-gray-500">
                    {uploadResult.pagesCreated} pages created
                  </p>
                )}
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={resetUpload}
              className="w-full"
            >
              Upload Another PDF
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PdfUploader;
