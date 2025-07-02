import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { saveTemplate } from '@/services/templateService';
import { uploadPdfAndCreatePages } from '@/utils/pdfUpload';
import ProfessionalDimensionsPanel from '@/components/admin/template/ProfessionalDimensionsPanel';
import ProfessionalPdfViewer from '@/components/admin/template/ProfessionalPdfViewer';
import ProfessionalZoneManager from '@/components/admin/template/ProfessionalZoneManager';
import { CoordinateSystem } from '@/utils/coordinateSystem';

interface PrintDimensions {
  width: number;
  height: number;
  unit: 'mm' | 'in' | 'pt';
}

interface PrintZone {
  id: string;
  name: string;
  type: 'image' | 'text';
  x: number; // in points
  y: number; // in points
  width: number; // in points
  height: number; // in points
  z_index: number;
}

const ProfessionalTemplateAdmin: React.FC = () => {
  // Template basic info
  const [templateInfo, setTemplateInfo] = useState({
    id: '',
    name: '',
    description: '',
    category: 'Corporate'
  });

  // Print dimensions
  const [dimensions, setDimensions] = useState<PrintDimensions>({
    width: 210,
    height: 297,
    unit: 'mm'
  });

  // PDF state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pageInfo, setPageInfo] = useState<{ pageNumber: number; width: number; height: number } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Zone management
  const [zones, setZones] = useState<PrintZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<PrintZone | null>(null);

  // Canvas reference
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Save template
  const handleSaveTemplate = async () => {
    if (!templateInfo.name.trim()) {
      toast.error('Template name is required');
      return;
    }

    try {
      const templateData = {
        ...templateInfo,
        dimensions: `${dimensions.width}x${dimensions.height}`,
        customWidth: dimensions.width,
        customHeight: dimensions.height,
        units: dimensions.unit,
        bleed: {
          top: 3,
          right: 3,
          bottom: 3,
          left: 3,
          units: 'mm'
        },
        isActive: false
      };

      const result = await saveTemplate(templateData);
      if (result) {
        setTemplateInfo(prev => ({ ...prev, id: result.id }));
        toast.success('Template saved successfully!');
      }
    } catch (error) {
      toast.error('Failed to save template');
    }
  };

  // Handle PDF upload
  const handlePdfUpload = async (file: File) => {
    if (!templateInfo.id) {
      toast.error('Please save the template first');
      return;
    }

    setIsUploading(true);
    setPdfFile(file);

    try {
      const result = await uploadPdfAndCreatePages(file, templateInfo.id);
      if (result.success) {
        setPdfUrl(result.pdfUrl || null);
        toast.success('PDF uploaded successfully!');
      } else {
        toast.error(result.message || 'PDF upload failed');
      }
    } catch (error) {
      toast.error('Failed to upload PDF');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle page change from PDF viewer
  const handlePageChange = useCallback((newPageInfo: { pageNumber: number; width: number; height: number }) => {
    setPageInfo(newPageInfo);
    
    // Validate PDF dimensions against template dimensions
    const pdfWidthMm = CoordinateSystem.convertUnit(newPageInfo.width, 'pt', 'mm');
    const pdfHeightMm = CoordinateSystem.convertUnit(newPageInfo.height, 'pt', 'mm');
    const templateWidthMm = CoordinateSystem.convertUnit(dimensions.width, dimensions.unit, 'mm');
    const templateHeightMm = CoordinateSystem.convertUnit(dimensions.height, dimensions.unit, 'mm');
    
    const widthDiff = Math.abs(pdfWidthMm - templateWidthMm);
    const heightDiff = Math.abs(pdfHeightMm - templateHeightMm);
    
    if (widthDiff > 1 || heightDiff > 1) { // 1mm tolerance
      toast.warning(
        `PDF dimensions (${Math.round(pdfWidthMm)}×${Math.round(pdfHeightMm)}mm) don't match template dimensions (${Math.round(templateWidthMm)}×${Math.round(templateHeightMm)}mm)`
      );
    }
  }, [dimensions]);

  // Handle canvas ready
  const handleCanvasReady = useCallback((canvas: HTMLCanvasElement) => {
    canvasRef.current = canvas;
  }, []);

  // Create new zone
  const handleZoneCreate = useCallback((type: 'image' | 'text') => {
    if (!pageInfo) {
      toast.error('Please load a PDF page first');
      return;
    }

    const newZone: PrintZone = {
      id: `zone-${Date.now()}`,
      name: `${type === 'image' ? 'Image' : 'Text'} Zone ${zones.length + 1}`,
      type,
      x: 50, // 50 points from left
      y: 50, // 50 points from top
      width: type === 'text' ? 200 : 150,
      height: type === 'text' ? 50 : 150,
      z_index: Math.max(...zones.map(z => z.z_index), 0) + 1
    };

    setZones(prev => [...prev, newZone]);
    setSelectedZone(newZone);
    toast.success(`${type === 'image' ? 'Image' : 'Text'} zone created`);
  }, [pageInfo, zones]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Professional Template Admin</h1>
            <p className="text-muted-foreground">Create print-ready calendar templates with millimeter precision</p>
          </div>
          <Button onClick={handleSaveTemplate} disabled={isUploading}>
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Template Settings */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Template Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Name</Label>
                  <Input
                    value={templateInfo.name}
                    onChange={(e) => setTemplateInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Template name"
                    className="text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Description</Label>
                  <Textarea
                    value={templateInfo.description}
                    onChange={(e) => setTemplateInfo(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Template description"
                    className="text-sm min-h-[60px]"
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Category</Label>
                  <Select 
                    value={templateInfo.category} 
                    onValueChange={(value) => setTemplateInfo(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Corporate">Corporate</SelectItem>
                      <SelectItem value="Creative">Creative</SelectItem>
                      <SelectItem value="Minimal">Minimal</SelectItem>
                      <SelectItem value="Vintage">Vintage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Dimensions */}
            <ProfessionalDimensionsPanel
              dimensions={dimensions}
              onDimensionsChange={setDimensions}
            />

            {/* PDF Upload */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">PDF Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePdfUpload(file);
                    }}
                    disabled={isUploading || !templateInfo.id}
                    className="text-sm"
                  />
                  {isUploading && (
                    <p className="text-xs text-muted-foreground">Uploading and processing...</p>
                  )}
                  {!templateInfo.id && (
                    <p className="text-xs text-muted-foreground">Save template first</p>
                  )}
                  {pageInfo && (
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Page {pageInfo.pageNumber}</div>
                      <div>
                        PDF: {Math.round(CoordinateSystem.convertUnit(pageInfo.width, 'pt', 'mm'))} × {Math.round(CoordinateSystem.convertUnit(pageInfo.height, 'pt', 'mm'))} mm
                      </div>
                      <div>
                        Template: {CoordinateSystem.convertUnit(dimensions.width, dimensions.unit, 'mm')} × {CoordinateSystem.convertUnit(dimensions.height, dimensions.unit, 'mm')} mm
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Panel - PDF Viewer */}
          <div className="lg:col-span-2">
            <ProfessionalPdfViewer
              pdfUrl={pdfUrl}
              onPageChange={handlePageChange}
              onCanvasReady={handleCanvasReady}
              className="h-full"
            />
          </div>

          {/* Right Panel - Zone Manager */}
          <div className="lg:col-span-1">
            <ProfessionalZoneManager
              zones={zones}
              onZonesChange={setZones}
              selectedZone={selectedZone}
              onZoneSelect={setSelectedZone}
              canvasRef={canvasRef}
              pageInfo={pageInfo}
              onZoneCreate={handleZoneCreate}
              unit={dimensions.unit}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalTemplateAdmin;