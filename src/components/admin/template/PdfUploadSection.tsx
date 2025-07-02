import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TemplatePage } from './types/templateTypes';

interface PdfUploadSectionProps {
  templateId: string;
  isUploading: boolean;
  pages: TemplatePage[];
  currentPage: TemplatePage | null;
  onPdfUpload: (file: File) => void;
  onPageSelect: (page: TemplatePage) => void;
}

const PdfUploadSection: React.FC<PdfUploadSectionProps> = ({
  templateId,
  isUploading,
  pages,
  currentPage,
  onPdfUpload,
  onPageSelect
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPdfUpload(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">PDF Upload & Pages</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* PDF Upload */}
        <div>
          <Label>PDF Upload</Label>
          <div className="mt-2">
            <Input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={isUploading || !templateId}
            />
            {isUploading && (
              <p className="text-sm text-muted-foreground mt-1">Uploading...</p>
            )}
            {!templateId && (
              <p className="text-sm text-muted-foreground mt-1">Save template first</p>
            )}
          </div>
        </div>

        {/* Page Navigation */}
        {pages.length > 0 && (
          <div className="pt-4 border-t">
            <Label>Pages</Label>
            <div className="mt-2 space-y-1">
              {pages.map(page => (
                <Button
                  key={page.id}
                  variant={currentPage?.id === page.id ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => onPageSelect(page)}
                >
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

export default PdfUploadSection;