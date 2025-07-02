import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface PDFManagerProps {
  onPagesChange: (pages: any[]) => void;
  onPageSelect: (page: any) => void;
}

const PDFManager: React.FC<PDFManagerProps> = ({ onPagesChange, onPageSelect }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [pages, setPages] = useState<any[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file || file.type !== 'application/pdf') return;

    setIsUploading(true);
    try {
      // TODO: Implement PDF upload and processing
      console.log('Uploading PDF:', file.name);
      
      // Mock pages for now
      const mockPages = [
        { id: '1', page_number: 1, preview_image_url: null },
        { id: '2', page_number: 2, preview_image_url: null },
      ];
      
      setPages(mockPages);
      onPagesChange(mockPages);
    } catch (error) {
      console.error('PDF upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  }, [onPagesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">PDF Upload</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pages.length === 0 ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
          >
            <input {...getInputProps()} />
            {isUploading ? (
              <div className="space-y-2">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground">Processing PDF...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {isDragActive ? 'Drop PDF here' : 'Drop PDF or click to upload'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-medium">{pages.length} pages loaded</p>
            <div className="space-y-1">
              {pages.map((page) => (
                <Button
                  key={page.id}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => onPageSelect(page)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Page {page.page_number}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PDFManager;