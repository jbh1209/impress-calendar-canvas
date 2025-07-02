import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Upload, Plus, Image, Type, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { saveTemplate } from '@/services/templateService';
import { uploadPdfAndCreatePages } from '@/utils/pdfUpload';
import { supabase } from '@/integrations/supabase/client';

interface Zone {
  id: string;
  name: string;
  type: 'image' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TemplatePage {
  id: string;
  page_number: number;
  pdf_page_width: number;
  pdf_page_height: number;
  template_id: string;
}

const TemplateAdmin: React.FC = () => {
  // Template state
  const [template, setTemplate] = useState({
    id: '',
    name: '',
    description: '',
    category: 'Corporate',
    dimensions: '210x297',
    units: 'mm',
    isActive: false
  });

  // PDF and pages state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pages, setPages] = useState<TemplatePage[]>([]);
  const [currentPage, setCurrentPage] = useState<TemplatePage | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Zone management
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Save template function
  const handleSaveTemplate = async () => {
    if (!template.name.trim()) {
      toast.error('Template name is required');
      return;
    }

    const result = await saveTemplate(template);
    if (result) {
      setTemplate(prev => ({ ...prev, id: result.id }));
      toast.success('Template saved successfully!');
    }
  };

  // PDF upload function
  const handlePdfUpload = async (file: File) => {
    if (!template.id) {
      toast.error('Please save the template first');
      return;
    }

    setIsUploading(true);
    setPdfFile(file);

    try {
      const result = await uploadPdfAndCreatePages(file, template.id);
      if (result.success) {
        setPdfUrl(result.pdfUrl || null);
        
        // Fetch the created pages
        const { data: pagesData, error } = await supabase
          .from('template_pages')
          .select('*')
          .eq('template_id', template.id)
          .order('page_number');

        if (error) {
          toast.error('Failed to load pages');
        } else {
          setPages(pagesData || []);
          if (pagesData && pagesData.length > 0) {
            setCurrentPage(pagesData[0]);
          }
        }
        toast.success('PDF uploaded and processed successfully!');
      } else {
        toast.error(result.message || 'PDF upload failed');
      }
    } catch (error) {
      toast.error('Failed to upload PDF');
    } finally {
      setIsUploading(false);
    }
  };

  // Canvas drawing functions
  const getCanvasCoordinates = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    const coords = getCanvasCoordinates(e);
    setIsDrawing(true);
    setDrawStart(coords);
  };

  const handleCanvasMouseUp = (e: React.MouseEvent) => {
    if (!isDrawing || !drawStart) return;

    const coords = getCanvasCoordinates(e);
    const width = Math.abs(coords.x - drawStart.x);
    const height = Math.abs(coords.y - drawStart.y);

    if (width > 10 && height > 10) {
      const newZone: Zone = {
        id: `zone-${Date.now()}`,
        name: `Zone ${zones.length + 1}`,
        type: 'image',
        x: Math.min(drawStart.x, coords.x),
        y: Math.min(drawStart.y, coords.y),
        width,
        height
      };
      setZones(prev => [...prev, newZone]);
      setSelectedZone(newZone);
    }

    setIsDrawing(false);
    setDrawStart(null);
    redrawCanvas();
  };

  // Canvas rendering
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw zones
    zones.forEach(zone => {
      ctx.strokeStyle = selectedZone?.id === zone.id ? '#3b82f6' : '#ef4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);

      // Draw zone label
      ctx.fillStyle = selectedZone?.id === zone.id ? '#3b82f6' : '#ef4444';
      ctx.font = '12px sans-serif';
      ctx.fillText(zone.name, zone.x + 5, zone.y + 15);
    });
  };

  // Zone management functions
  const addZone = (type: 'image' | 'text') => {
    const newZone: Zone = {
      id: `zone-${Date.now()}`,
      name: `${type === 'image' ? 'Image' : 'Text'} Zone ${zones.length + 1}`,
      type,
      x: 50,
      y: 50,
      width: 100,
      height: type === 'text' ? 30 : 100
    };
    setZones(prev => [...prev, newZone]);
    setSelectedZone(newZone);
  };

  const updateZone = (updates: Partial<Zone>) => {
    if (!selectedZone) return;
    
    const updatedZone = { ...selectedZone, ...updates };
    setZones(zones.map(z => z.id === selectedZone.id ? updatedZone : z));
    setSelectedZone(updatedZone);
  };

  const deleteZone = (zoneId: string) => {
    setZones(zones.filter(z => z.id !== zoneId));
    if (selectedZone?.id === zoneId) {
      setSelectedZone(null);
    }
  };

  // Update canvas when zones change
  useEffect(() => {
    redrawCanvas();
  }, [zones, selectedZone]);

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
          {/* Template Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={template.name}
                  onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Template name"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={template.description}
                  onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Template description"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={template.category} onValueChange={(value) => setTemplate(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
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

              <div>
                <Label htmlFor="dimensions">Dimensions</Label>
                <Input
                  id="dimensions"
                  value={template.dimensions}
                  onChange={(e) => setTemplate(prev => ({ ...prev, dimensions: e.target.value }))}
                  placeholder="210x297"
                />
              </div>

              {/* PDF Upload */}
              <div className="pt-4 border-t">
                <Label>PDF Upload</Label>
                <div className="mt-2">
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePdfUpload(file);
                    }}
                    disabled={isUploading || !template.id}
                  />
                  {isUploading && <p className="text-sm text-muted-foreground mt-1">Uploading...</p>}
                  {!template.id && <p className="text-sm text-muted-foreground mt-1">Save template first</p>}
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
                        onClick={() => setCurrentPage(page)}
                      >
                        Page {page.page_number}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Canvas */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Canvas {currentPage && `- Page ${currentPage.page_number}`}</CardTitle>
            </CardHeader>
            <CardContent>
              {currentPage ? (
                <div ref={containerRef} className="relative border rounded-lg bg-white">
                  <canvas
                    ref={canvasRef}
                    width={currentPage.pdf_page_width || 400}
                    height={currentPage.pdf_page_height || 600}
                    className="max-w-full h-auto cursor-crosshair"
                    onMouseDown={handleCanvasMouseDown}
                    onMouseUp={handleCanvasMouseUp}
                    style={{ 
                      maxHeight: '600px',
                      objectFit: 'contain'
                    }}
                  />
                  {pdfUrl && (
                    <object
                      data={`${pdfUrl}#page=${currentPage.page_number}`}
                      type="application/pdf"
                      className="absolute inset-0 w-full h-full pointer-events-none opacity-50"
                      style={{ maxHeight: '600px' }}
                    />
                  )}
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground">Upload a PDF to start creating zones</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Zone Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Zone Editor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Zone Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => addZone('image')} className="flex-1">
                  <Image className="h-4 w-4 mr-2" />
                  Image
                </Button>
                <Button variant="outline" size="sm" onClick={() => addZone('text')} className="flex-1">
                  <Type className="h-4 w-4 mr-2" />
                  Text
                </Button>
              </div>

              {/* Zone List */}
              {zones.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">Zones</Label>
                  {zones.map(zone => (
                    <div
                      key={zone.id}
                      className={`flex items-center justify-between p-2 rounded border cursor-pointer ${
                        selectedZone?.id === zone.id ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                      onClick={() => setSelectedZone(zone)}
                    >
                      <span className="text-sm">{zone.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteZone(zone.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Zone Properties */}
              {selectedZone && (
                <div className="space-y-3 pt-4 border-t">
                  <Label className="text-sm">Zone Properties</Label>
                  
                  <div>
                    <Label htmlFor="zone-name" className="text-xs">Name</Label>
                    <Input
                      id="zone-name"
                      value={selectedZone.name}
                      onChange={(e) => updateZone({ name: e.target.value })}
                      className="h-8"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="zone-x" className="text-xs">X</Label>
                      <Input
                        id="zone-x"
                        type="number"
                        value={Math.round(selectedZone.x)}
                        onChange={(e) => updateZone({ x: parseInt(e.target.value) || 0 })}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zone-y" className="text-xs">Y</Label>
                      <Input
                        id="zone-y"
                        type="number"
                        value={Math.round(selectedZone.y)}
                        onChange={(e) => updateZone({ y: parseInt(e.target.value) || 0 })}
                        className="h-8"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="zone-width" className="text-xs">Width</Label>
                      <Input
                        id="zone-width"
                        type="number"
                        value={Math.round(selectedZone.width)}
                        onChange={(e) => updateZone({ width: parseInt(e.target.value) || 0 })}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zone-height" className="text-xs">Height</Label>
                      <Input
                        id="zone-height"
                        type="number"
                        value={Math.round(selectedZone.height)}
                        onChange={(e) => updateZone({ height: parseInt(e.target.value) || 0 })}
                        className="h-8"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TemplateAdmin;