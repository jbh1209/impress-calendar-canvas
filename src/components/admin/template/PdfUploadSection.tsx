
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, Image, AlertCircle, CheckCircle } from "lucide-react";
import { generateAllPDFPreviews } from "@/utils/pdfPreviewGenerator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface PdfUploadSectionProps {
  templateId: string;
  onProcessingComplete?: () => void;
}

interface ProcessingStatus {
  stage: 'uploading' | 'generating' | 'completed' | 'failed';
  progress: number;
  message: string;
  details?: string[];
}

const PdfUploadSection: React.FC<PdfUploadSectionProps> = ({
  templateId,
  onProcessingComplete
}) => {
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleButtonClick = () => {
    if (!processingStatus || processingStatus.stage === 'completed' || processingStatus.stage === 'failed') {
      fileInputRef.current?.click();
    }
  };

  const resetProcessing = () => {
    setProcessingStatus(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadPdfFile = async (file: File) => {
    if (!file || !templateId) {
      console.error("Missing file or template ID");
      toast.error("Missing file or template ID");
      return;
    }

    // Validate file
    if (file.type !== 'application/pdf') {
      toast.error("Please upload a PDF file");
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      toast.error("PDF file is too large. Maximum size is 50MB.");
      return;
    }
    
    console.log(`[PdfUploadSection] Starting upload process for file: ${file.name} (${file.size} bytes)`);

    try {
      // Stage 1: Upload PDF and create page records
      setProcessingStatus({
        stage: 'uploading',
        progress: 10,
        message: 'Uploading PDF and extracting pages...',
        details: [`File: ${file.name}`, `Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`]
      });

      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("template_id", templateId);

      console.log(`[PdfUploadSection] Calling split-pdf function`);

      const { data, error } = await supabase.functions.invoke('split-pdf', {
        body: formData,
      });

      if (error) {
        console.error("[PdfUploadSection] Error from split-pdf:", error);
        throw new Error(`PDF processing failed: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.message || 'PDF processing failed');
      }

      console.log(`[PdfUploadSection] PDF processed successfully:`, data);

      setProcessingStatus({
        stage: 'uploading',
        progress: 40,
        message: `PDF processed successfully! ${data.pagesCreated} pages created.`,
        details: data.pagesFailed > 0 ? [`${data.pagesFailed} pages failed to process`] : []
      });

      toast.success(`PDF uploaded successfully! ${data.pagesCreated} pages created.`);
      
      // Stage 2: Generate preview images
      if (data.success && data.pages && data.pdfUrl) {
        console.log(`[PdfUploadSection] Starting preview generation for ${data.pages.length} pages`);
        
        setProcessingStatus({
          stage: 'generating',
          progress: 50,
          message: 'Generating preview images...',
          details: [`Processing ${data.pages.length} pages`, 'This may take a few moments...']
        });
        
        const previewResults = await generateAllPDFPreviews(
          data.pdfUrl,
          data.pages,
          templateId,
          (current, total, status) => {
            const progress = 50 + Math.round((current / total) * 40); // 50-90% range
            setProcessingStatus({
              stage: 'generating',
              progress,
              message: status,
              details: [`Page ${current} of ${total}`, `${previewResults?.success || 0} completed`]
            });
          }
        );
        
        console.log(`[PdfUploadSection] Preview generation completed:`, previewResults);
        
        // Final status
        const hasFailures = previewResults.failed > 0;
        setProcessingStatus({
          stage: hasFailures ? 'failed' : 'completed',
          progress: 100,
          message: hasFailures 
            ? `Completed with ${previewResults.failed} failures` 
            : `Successfully processed all ${previewResults.success} pages!`,
          details: hasFailures ? previewResults.errors.slice(0, 3) : [`${previewResults.success} preview images generated`]
        });
        
        if (previewResults.success > 0) {
          toast.success(`Successfully generated ${previewResults.success} preview images!`);
        }
        
        if (previewResults.failed > 0) {
          toast.error(`Failed to generate ${previewResults.failed} preview images. Check the details below.`);
        }
      }
      
      if (onProcessingComplete) {
        onProcessingComplete();
      }
      
    } catch (error: any) {
      console.error("[PdfUploadSection] Upload error:", error);
      
      setProcessingStatus({
        stage: 'failed',
        progress: 0,
        message: 'Processing failed',
        details: [error.message || 'Unknown error occurred', 'Please try again or contact support']
      });
      
      toast.error(error.message || "PDF processing failed. Please try again.");
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

  const isProcessing = processingStatus && ['uploading', 'generating'].includes(processingStatus.stage);

  return (
    <Card>
      <CardContent className="p-4">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
            isProcessing 
              ? "bg-gray-50 border-gray-200 cursor-not-allowed" 
              : dragOver 
                ? "bg-blue-50 border-blue-300 cursor-pointer" 
                : "bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-gray-100 cursor-pointer"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          {!processingStatus ? (
            <>
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
              
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Select PDF File
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              {/* Status Icon */}
              <div className="flex justify-center mb-4">
                {processingStatus.stage === 'completed' ? (
                  <CheckCircle className="h-12 w-12 text-green-500" />
                ) : processingStatus.stage === 'failed' ? (
                  <AlertCircle className="h-12 w-12 text-red-500" />
                ) : processingStatus.stage === 'generating' ? (
                  <Image className="h-12 w-12 text-blue-500 animate-pulse" />
                ) : (
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <Progress value={processingStatus.progress} className="w-full" />
                <p className="text-sm font-medium text-gray-900">
                  {processingStatus.message}
                </p>
              </div>

              {/* Details */}
              {processingStatus.details && processingStatus.details.length > 0 && (
                <div className="text-xs text-gray-600 space-y-1">
                  {processingStatus.details.map((detail, index) => (
                    <div key={index}>• {detail}</div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              {(processingStatus.stage === 'completed' || processingStatus.stage === 'failed') && (
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={resetProcessing}
                  >
                    Upload Another PDF
                  </Button>
                  {processingStatus.stage === 'failed' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (fileInputRef.current?.files?.[0]) {
                          uploadPdfFile(fileInputRef.current.files[0]);
                        }
                      }}
                    >
                      Retry
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status Alerts */}
        {processingStatus?.stage === 'failed' && (
          <Alert className="mt-4" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Processing failed. Please check the PDF file and try again. If the problem persists, contact support.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default PdfUploadSection;
