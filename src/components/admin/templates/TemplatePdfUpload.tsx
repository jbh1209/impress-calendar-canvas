import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, ArrowLeft, FileText } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TemplatePdfUploadProps {
  templateId: string;
  onBack: () => void;
  onComplete: () => void;
}

const TemplatePdfUpload = ({ templateId, onBack, onComplete }: TemplatePdfUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error("Please select a PDF file");
        return;
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast.error("File size must be less than 50MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a PDF file");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Simulate progress for user feedback
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const formData = new FormData();
      formData.append('pdf', selectedFile);
      formData.append('template_id', templateId);

      const { data, error } = await supabase.functions.invoke('process-template-pdf', {
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) {
        console.error('Upload error:', error);
        toast.error("Failed to process PDF");
        return;
      }

      if (!data?.success) {
        toast.error(data?.error || "Failed to process PDF");
        return;
      }

      toast.success(data.message);
      setTimeout(() => {
        onComplete();
      }, 1000);

    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error("An unexpected error occurred");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Templates
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Upload Template PDF</h2>
          <p className="text-muted-foreground">Upload a PDF to create template pages</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>PDF Upload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!selectedFile ? (
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">Select a PDF file</p>
              <p className="text-sm text-muted-foreground mb-4">
                Choose a PDF template file (max 50MB)
              </p>
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Choose PDF File
              </Button>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                ref={fileInputRef}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <FileText className="h-8 w-8 text-blue-500" />
                <div className="flex-1">
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {!uploading && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    Remove
                  </Button>
                )}
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing PDF...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={handleUpload} 
                  disabled={uploading}
                  className="flex-1"
                >
                  {uploading ? 'Processing...' : 'Upload & Process PDF'}
                </Button>
                {!uploading && (
                  <Button variant="outline" onClick={() => setSelectedFile(null)}>
                    Choose Different File
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p>• PDF will be processed to extract pages and dimensions</p>
            <p>• Each page will become available for zone creation</p>
            <p>• Processing time depends on file size and page count</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplatePdfUpload;