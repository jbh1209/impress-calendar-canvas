
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Upload, Square, Type, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Canvas as FabricCanvas, Rect, Text as FabricText } from "fabric";
import * as pdfjsLib from "pdfjs-dist";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface Zone {
  id: string;
  type: 'text' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
}

interface Template {
  id?: string;
  name: string;
  category: string;
  zones: Zone[];
}

const SimpleTemplateEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [template, setTemplate] = useState<Template>({
    name: '',
    category: 'calendar',
    zones: []
  });
  
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const isCreateMode = !id;

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: "#ffffff",
      selection: true,
    });

    setFabricCanvas(canvas);

    // Handle object selection
    canvas.on('selection:created', (e) => {
      const activeObject = e.selected?.[0];
      if (activeObject && activeObject.data?.zoneId) {
        setSelectedZone(activeObject.data.zoneId);
      }
    });

    canvas.on('selection:cleared', () => {
      setSelectedZone(null);
    });

    return () => {
      canvas.dispose();
    };
  }, []);

  // Handle PDF upload
  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument(arrayBuffer);
      const pdf = await loadingTask.promise;
      
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      
      await renderPdfPage(pdf, 1);
      toast.success("PDF loaded successfully");
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast.error("Failed to load PDF");
    } finally {
      setIsLoading(false);
    }
  };

  // Render PDF page on canvas
  const renderPdfPage = async (pdf: any, pageNumber: number) => {
    if (!fabricCanvas) return;

    try {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1 });
      
      // Calculate scale to fit canvas
      const canvasWidth = fabricCanvas.width!;
      const canvasHeight = fabricCanvas.height!;
      const scale = Math.min(canvasWidth / viewport.width, canvasHeight / viewport.height) * 0.9;
      
      const scaledViewport = page.getViewport({ scale });
      
      // Create temporary canvas for PDF rendering
      const tempCanvas = document.createElement('canvas');
      const tempContext = tempCanvas.getContext('2d');
      tempCanvas.width = scaledViewport.width;
      tempCanvas.height = scaledViewport.height;

      await page.render({
        canvasContext: tempContext,
        viewport: scaledViewport
      }).promise;

      // Clear canvas and add PDF as background
      fabricCanvas.clear();
      fabricCanvas.setBackgroundImage(
        tempCanvas.toDataURL(),
        fabricCanvas.renderAll.bind(fabricCanvas),
        {
          scaleX: 1,
          scaleY: 1,
          originX: 'center',
          originY: 'center',
          left: canvasWidth / 2,
          top: canvasHeight / 2
        }
      );

      // Re-add existing zones
      redrawZones();
      
    } catch (error) {
      console.error('Error rendering PDF page:', error);
      toast.error("Failed to render PDF page");
    }
  };

  // Navigate between PDF pages
  const goToPage = async (pageNumber: number) => {
    if (!pdfDoc || pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
    await renderPdfPage(pdfDoc, pageNumber);
  };

  // Add a new zone
  const addZone = (type: 'text' | 'image') => {
    if (!fabricCanvas) return;

    const zoneId = `zone-${Date.now()}`;
    const color = type === 'text' ? '#10b981' : '#3b82f6';
    
    const rect = new Rect({
      left: 100,
      top: 100,
      width: 200,
      height: type === 'text' ? 50 : 150,
      fill: `${color}20`,
      stroke: color,
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      data: { zoneId, type }
    });

    const label = new FabricText(`${type} Zone`, {
      left: 200,
      top: type === 'text' ? 125 : 175,
      fontSize: 12,
      fill: color,
      fontFamily: 'Arial',
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
      data: { zoneId, isLabel: true }
    });

    fabricCanvas.add(rect);
    fabricCanvas.add(label);
    fabricCanvas.setActiveObject(rect);

    // Add to template zones
    const newZone: Zone = {
      id: zoneId,
      type,
      x: 100,
      y: 100,
      width: 200,
      height: type === 'text' ? 50 : 150,
      name: `${type} Zone`
    };

    setTemplate(prev => ({
      ...prev,
      zones: [...prev.zones, newZone]
    }));

    setSelectedZone(zoneId);
    toast.success(`${type} zone added`);
  };

  // Delete selected zone
  const deleteZone = () => {
    if (!fabricCanvas || !selectedZone) return;

    // Remove from canvas
    const objects = fabricCanvas.getObjects();
    const toRemove = objects.filter(obj => obj.data?.zoneId === selectedZone);
    toRemove.forEach(obj => fabricCanvas.remove(obj));

    // Remove from template
    setTemplate(prev => ({
      ...prev,
      zones: prev.zones.filter(zone => zone.id !== selectedZone)
    }));

    setSelectedZone(null);
    toast.success("Zone deleted");
  };

  // Redraw zones on canvas
  const redrawZones = () => {
    if (!fabricCanvas) return;

    template.zones.forEach(zone => {
      const color = zone.type === 'text' ? '#10b981' : '#3b82f6';
      
      const rect = new Rect({
        left: zone.x,
        top: zone.y,
        width: zone.width,
        height: zone.height,
        fill: `${color}20`,
        stroke: color,
        strokeWidth: 2,
        strokeDashArray: [5, 5],
        data: { zoneId: zone.id, type: zone.type }
      });

      const label = new FabricText(zone.name, {
        left: zone.x + zone.width / 2,
        top: zone.y + zone.height / 2,
        fontSize: 12,
        fill: color,
        fontFamily: 'Arial',
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
        data: { zoneId: zone.id, isLabel: true }
      });

      fabricCanvas.add(rect);
      fabricCanvas.add(label);
    });
  };

  // Save template
  const handleSave = async () => {
    if (!template.name.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    // In a real app, this would save to the database
    console.log('Saving template:', template);
    toast.success("Template saved successfully");
    
    if (isCreateMode) {
      // In create mode, redirect to edit mode
      navigate(`/admin/templates/edit/new-template-id`);
    }
  };

  const selectedZoneData = template.zones.find(z => z.id === selectedZone);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/admin/templates')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">
              {isCreateMode ? 'Create Template' : 'Edit Template'}
            </h1>
          </div>
          
          <Button onClick={handleSave} disabled={!template.name.trim()}>
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 p-6 space-y-6">
          {/* Template Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Template Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={template.name}
                  onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter template name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={template.category}
                  onChange={(e) => setTemplate(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="calendar">Calendar</option>
                  <option value="poster">Poster</option>
                  <option value="flyer">Flyer</option>
                  <option value="business-card">Business Card</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* PDF Upload */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">PDF Template</CardTitle>
            </CardHeader>
            <CardContent>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handlePdfUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
                disabled={isLoading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isLoading ? 'Loading...' : 'Upload PDF'}
              </Button>
              
              {totalPages > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Page {currentPage} of {totalPages}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Zone Tools */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Add Zones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addZone('image')}
                  className="w-full justify-start"
                >
                  <Square className="h-3 w-3 mr-2" />
                  Image Zone
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addZone('text')}
                  className="w-full justify-start"
                >
                  <Type className="h-3 w-3 mr-2" />
                  Text Zone
                </Button>
              </div>
              
              {selectedZone && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Selected Zone</span>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={deleteZone}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  {selectedZoneData && (
                    <div className="mt-2 text-sm text-gray-600">
                      <div>{selectedZoneData.name}</div>
                      <div>Type: {selectedZoneData.type}</div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Zones List */}
          {template.zones.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Zones ({template.zones.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {template.zones.map((zone) => (
                    <div
                      key={zone.id}
                      className={`p-2 rounded text-sm cursor-pointer transition-colors ${
                        selectedZone === zone.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedZone(zone.id)}
                    >
                      <div className="font-medium">{zone.name}</div>
                      <div className="text-gray-500 text-xs">{zone.type}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 p-6">
          <Card>
            <CardContent className="p-4">
              <div className="border-2 border-gray-200 rounded-lg bg-white overflow-hidden">
                <canvas ref={canvasRef} className="max-w-full" />
              </div>
              
              {!pdfDoc && (
                <div className="absolute inset-4 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📄</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Upload PDF Template
                    </h3>
                    <p className="text-sm text-gray-600">
                      Upload a PDF file to start creating customizable zones
                    </p>
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

export default SimpleTemplateEditor;
