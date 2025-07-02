import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { useTemplateAdmin } from '@/hooks/admin/template/useTemplateAdmin';
import { useCanvasDrawing } from '@/hooks/admin/template/useCanvasDrawing';
import TemplateInfoForm from '@/components/admin/template/TemplateInfoForm';
import PdfUploadSection from '@/components/admin/template/PdfUploadSection';
import CanvasArea from '@/components/admin/template/CanvasArea';
import ZoneManagementPanel from '@/components/admin/template/ZoneManagementPanel';

const RefactoredTemplateAdmin: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const {
    template,
    pdfUrl,
    pages,
    currentPage,
    isUploading,
    zones,
    selectedZone,
    isDrawing,
    drawStart,
    setTemplate,
    setCurrentPage,
    setSelectedZone,
    setIsDrawing,
    setDrawStart,
    handleSaveTemplate,
    handlePdfUpload,
    addZone,
    updateZone,
    deleteZone
  } = useTemplateAdmin();

  const { handleCanvasMouseDown, handleCanvasMouseUp } = useCanvasDrawing({
    canvasRef,
    zones,
    selectedZone,
    isDrawing,
    drawStart,
    onZoneCreate: (zone) => {
      setSelectedZone(zone);
    },
    onZoneSelect: setSelectedZone,
    setIsDrawing,
    setDrawStart
  });

  const handleCanvasReady = (canvas: HTMLCanvasElement) => {
    canvasRef.current = canvas;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Template Admin</h1>
            <p className="text-muted-foreground">Create and manage calendar templates</p>
          </div>
          <Button onClick={handleSaveTemplate}>
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Template Settings */}
          <div className="space-y-6">
            <TemplateInfoForm 
              template={template} 
              onTemplateChange={setTemplate} 
            />
            
            <PdfUploadSection
              templateId={template.id}
              isUploading={isUploading}
              pages={pages}
              currentPage={currentPage}
              onPdfUpload={handlePdfUpload}
              onPageSelect={setCurrentPage}
            />
          </div>

          {/* Center Panel - Canvas */}
          <CanvasArea
            currentPage={currentPage}
            pdfUrl={pdfUrl}
            zones={zones}
            selectedZone={selectedZone}
            onCanvasMouseDown={handleCanvasMouseDown}
            onCanvasMouseUp={handleCanvasMouseUp}
            onCanvasReady={handleCanvasReady}
          />

          {/* Right Panel - Zone Editor */}
          <ZoneManagementPanel
            zones={zones}
            selectedZone={selectedZone}
            onAddZone={addZone}
            onZoneSelect={setSelectedZone}
            onUpdateZone={updateZone}
            onDeleteZone={deleteZone}
          />
        </div>
      </div>
    </div>
  );
};

export default RefactoredTemplateAdmin;