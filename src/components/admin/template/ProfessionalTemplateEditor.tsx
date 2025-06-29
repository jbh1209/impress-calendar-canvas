import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Upload, Loader2, Image, Type, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { Canvas as FabricCanvas, Rect, Text as FabricText } from "fabric";
import { uploadPdfAndCreatePages } from "@/utils/pdfUpload";
import { getTemplateById, saveTemplate } from "@/services/templateService";
import { getTemplatePages } from "@/services/templatePageService";
import { getCustomizationZonesByTemplateId, saveCustomizationZone, deleteCustomizationZone } from "@/services/customizationZoneService";
import { saveZoneAssignments, getZoneAssignmentsByPageId } from "@/services/zonePageAssignmentService";
import type { Template, TemplatePage, CustomizationZone, ZonePageAssignment } from "@/services/types/templateTypes";

interface UITemplateState {
  name: string;
  description: string;
  category: string;
  dimensions: string;
  is_active: boolean;
}

const ProfessionalTemplateEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Template state
  const [template, setTemplate] = useState<UITemplateState>({
    name: '',
    description: '',
    category: 'calendar',
    dimensions: '',
    is_active: false
  });
  
  // PDF and pages state
  const [pages, setPages] = useState<TemplatePage[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  
  // Canvas and zones state
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [zones, setZones] = useState<CustomizationZone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isCreateMode = !id;
  const currentPage = pages[currentPageIndex];

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: "#f8fafc",
      selection: true,
    });

    // Handle object selection
    canvas.on('selection:created', (e) => {
      const activeObject = e.selected?.[0];
      if (activeObject && (activeObject as any).zoneId) {
        setSelectedZoneId((activeObject as any).zoneId);
      }
    });

    canvas.on('selection:cleared', () => {
      setSelectedZoneId(null);
    });

    // Handle object modifications
    canvas.on('object:modified', () => {
      handleZonePositionUpdate();
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  // Load template data
  useEffect(() => {
    if (id && id !== 'create') {
      loadTemplate(id);
    }
  }, [id]);

  // Load pages when template changes
  useEffect(() => {
    if (id && id !== 'create') {
      loadTemplatePages(id);
      loadTemplateZones(id);
    }
  }, [id]);

  // Update canvas when page changes
  useEffect(() => {
    if (currentPage && fabricCanvas) {
      updateCanvasBackground();
      loadPageZones();
    }
  }, [currentPage, fabricCanvas]);

  const loadTemplate = async (templateId: string) => {
    setIsLoading(true);
    try {
      const templateData = await getTemplateById(templateId);
      if (templateData) {
        setTemplate({
          name: templateData.name,
          description: templateData.description || '',
          category: templateData.category,
          dimensions: templateData.dimensions || '',
          is_active: templateData.is_active
        });
      }
    } catch (error) {
      console.error('Error loading template:', error);
      toast.error('Failed to load template');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplatePages = async (templateId: string) => {
    try {
      const pagesData = await getTemplatePages(templateId);
      setPages(pagesData);
      if (pagesData.length > 0) {
        setCurrentPageIndex(0);
      }
    } catch (error) {
      console.error('Error loading pages:', error);
      toast.error('Failed to load template pages');
    }
  };

  const loadTemplateZones = async (templateId: string) => {
    try {
      const zonesData = await getCustomizationZonesByTemplateId(templateId);
      setZones(zonesData);
    } catch (error) {
      console.error('Error loading zones:', error);
      toast.error('Failed to load customization zones');
    }
  };

  const updateCanvasBackground = () => {
    if (!fabricCanvas || !currentPage) return;

    fabricCanvas.clear();

    if (currentPage.preview_image_url) {
      // Load page preview as background using Fabric.js v6 Image.fromURL
      import('fabric').then(({ Image: FabricImage }) => {
        FabricImage.fromURL(currentPage.preview_image_url!, {
          crossOrigin: 'anonymous'
        }).then((img) => {
          const canvasWidth = fabricCanvas.width!;
          const canvasHeight = fabricCanvas.height!;
          
          // Calculate scale to fit image in canvas
          const scale = Math.min(canvasWidth / img.width!, canvasHeight / img.height!) * 0.9;
          const scaledWidth = img.width! * scale;
          const scaledHeight = img.height! * scale;
          
          img.set({
            scaleX: scale,
            scaleY: scale,
            left: (canvasWidth - scaledWidth) / 2,
            top: (canvasHeight - scaledHeight) / 2,
            selectable: false,
            evented: false,
          });

          fabricCanvas.backgroundImage = img;
          fabricCanvas.renderAll();
        }).catch((error) => {
          console.error('Error loading background image:', error);
          toast.error('Failed to load page preview');
        });
      });
    }
  };

  const loadPageZones = async () => {
    if (!currentPage || !fabricCanvas) return;

    try {
      const assignments = await getZoneAssignmentsByPageId(currentPage.id);
      
      // Clear existing zone objects
      const objects = fabricCanvas.getObjects().filter(obj => (obj as any).zoneId);
      objects.forEach(obj => fabricCanvas.remove(obj));

      // Add zone rectangles for this page
      assignments.forEach(assignment => {
        const zone = zones.find(z => z.id === assignment.zone_id);
        if (!zone) return;

        addZoneToCanvas(zone, assignment);
      });

      fabricCanvas.renderAll();
    } catch (error) {
      console.error('Error loading page zones:', error);
    }
  };

  const addZoneToCanvas = (zone: CustomizationZone, assignment: ZonePageAssignment) => {
    if (!fabricCanvas || !currentPage) return;

    const color = zone.type === 'text' ? '#10b981' : '#3b82f6';
    
    // Convert PDF coordinates to canvas coordinates
    const canvasWidth = fabricCanvas.width!;
    const canvasHeight = fabricCanvas.height!;
    const pdfWidth = currentPage.pdf_page_width || 612;
    const pdfHeight = currentPage.pdf_page_height || 792;
    
    const scaleX = (canvasWidth * 0.9) / pdfWidth;
    const scaleY = (canvasHeight * 0.9) / pdfHeight;
    const offsetX = canvasWidth * 0.05;
    const offsetY = canvasHeight * 0.05;
    
    const rect = new Rect({
      left: assignment.x * scaleX + offsetX,
      top: assignment.y * scaleY + offsetY,
      width: assignment.width * scaleX,
      height: assignment.height * scaleY,
      fill: `${color}20`,
      stroke: color,
      strokeWidth: 2,
      strokeDashArray: [5, 5],
    });

    (rect as any).zoneId = zone.id;
    (rect as any).zoneType = zone.type;

    const label = new FabricText(zone.name, {
      left: assignment.x * scaleX + offsetX + (assignment.width * scaleX) / 2,
      top: assignment.y * scaleY + offsetY + (assignment.height * scaleY) / 2,
      fontSize: 12,
      fill: color,
      fontFamily: 'Arial',
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
    });

    fabricCanvas.add(rect);
    fabricCanvas.add(label);
  };

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!template.name.trim()) {
      toast.error("Please enter a template name first");
      return;
    }

    setIsProcessingPdf(true);
    setProcessingStatus('Uploading PDF...');

    try {
      // First save the template to get an ID
      const savedTemplate = await saveTemplate({ 
        ...template, 
        id,
        isActive: template.is_active 
      });
      if (!savedTemplate) {
        throw new Error('Failed to save template');
      }

      const templateId = savedTemplate.id;
      
      const result = await uploadPdfAndCreatePages(
        file, 
        templateId,
        (status) => setProcessingStatus(status)
      );

      if (result.success) {
        toast.success(result.message);
        await loadTemplatePages(templateId);
        if (!isCreateMode) {
          // Reload template to get updated metadata
          await loadTemplate(templateId);
        }
      } else {
        toast.error(result.message || 'PDF processing failed');
      }
    } catch (error) {
      console.error('PDF upload error:', error);
      toast.error('Failed to process PDF');
    } finally {
      setIsProcessingPdf(false);
      setProcessingStatus('');
    }
  };

  const createZone = async (type: 'text' | 'image') => {
    if (!id || isCreateMode) {
      toast.error("Please save the template first");
      return;
    }

    try {
      const newZone: Omit<CustomizationZone, 'id'> = {
        template_id: id,
        name: `${type} Zone ${zones.length + 1}`,
        type,
        x: 50,
        y: 50,
        width: type === 'text' ? 200 : 150,
        height: type === 'text' ? 40 : 150,
        z_index: zones.length
      };

      const savedZone = await saveCustomizationZone(newZone);
      if (savedZone) {
        setZones(prev => [...prev, savedZone]);
        toast.success(`${type} zone created`);
      }
    } catch (error) {
      console.error('Error creating zone:', error);
      toast.error('Failed to create zone');
    }
  };

  const deleteZone = async () => {
    if (!selectedZoneId) return;

    try {
      const success = await deleteCustomizationZone(selectedZoneId);
      if (success) {
        setZones(prev => prev.filter(z => z.id !== selectedZoneId));
        setSelectedZoneId(null);
        
        // Remove from canvas
        const objects = fabricCanvas?.getObjects().filter(obj => (obj as any).zoneId === selectedZoneId) || [];
        objects.forEach(obj => fabricCanvas?.remove(obj));
        fabricCanvas?.renderAll();
        
        toast.success('Zone deleted');
      }
    } catch (error) {
      console.error('Error deleting zone:', error);
      toast.error('Failed to delete zone');
    }
  };

  const handleZonePositionUpdate = async () => {
    if (!fabricCanvas || !currentPage || !selectedZoneId) return;

    const activeObject = fabricCanvas.getActiveObject();
    if (!activeObject || !(activeObject as any).zoneId) return;

    // Convert canvas coordinates back to PDF coordinates
    const canvasWidth = fabricCanvas.width!;
    const canvasHeight = fabricCanvas.height!;
    const pdfWidth = currentPage.pdf_page_width || 612;
    const pdfHeight = currentPage.pdf_page_height || 792;
    
    const scaleX = pdfWidth / (canvasWidth * 0.9);
    const scaleY = pdfHeight / (canvasHeight * 0.9);
    const offsetX = canvasWidth * 0.05;
    const offsetY = canvasHeight * 0.05;

    const assignment: Omit<ZonePageAssignment, 'id'> = {
      zone_id: selectedZoneId,
      page_id: currentPage.id,
      x: (activeObject.left! - offsetX) * scaleX,
      y: (activeObject.top! - offsetY) * scaleY,
      width: (activeObject.width! * activeObject.scaleX!) * scaleX,
      height: (activeObject.height! * activeObject.scaleY!) * scaleY,
      z_index: 0,
      is_repeating: false
    };

    // Save the assignment
    await saveZoneAssignments([assignment], currentPage.id);
  };

  const handleSave = async () => {
    if (!template.name.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    try {
      const savedTemplate = await saveTemplate({ 
        ...template, 
        id,
        isActive: template.is_active 
      });
      if (savedTemplate) {
        toast.success("Template saved successfully");
        if (isCreateMode) {
          navigate(`/admin/templates/edit/${savedTemplate.id}`);
        }
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };

  const selectedZone = zones.find(z => z.id === selectedZoneId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
        <div className="w-80 bg-white border-r border-gray-200 p-6 space-y-6 max-h-screen overflow-y-auto">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter template name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={template.description}
                  onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter template description"
                  rows={3}
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

              {template.dimensions && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dimensions
                  </label>
                  <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                    {template.dimensions}
                  </div>
                </div>
              )}
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
                disabled={isProcessingPdf}
              >
                {isProcessingPdf ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {isProcessingPdf ? 'Processing...' : 'Upload PDF'}
              </Button>
              
              {isProcessingPdf && processingStatus && (
                <div className="mt-2 text-xs text-gray-600 text-center">
                  {processingStatus}
                </div>
              )}
              
              {pages.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Pages ({pages.length})
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {pages.map((page, index) => (
                      <button
                        key={page.id}
                        onClick={() => setCurrentPageIndex(index)}
                        className={`aspect-[3/4] border-2 rounded text-xs flex items-center justify-center transition-colors ${
                          index === currentPageIndex
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {page.page_number}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Zone Management */}
          {!isCreateMode && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Customization Zones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => createZone('image')}
                    className="w-full justify-start"
                  >
                    <Image className="h-3 w-3 mr-2" />
                    Add Image Zone
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => createZone('text')}
                    className="w-full justify-start"
                  >
                    <Type className="h-3 w-3 mr-2" />
                    Add Text Zone
                  </Button>
                </div>
                
                {selectedZone && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">
                        Selected: {selectedZone.name}
                      </span>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={deleteZone}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-xs text-blue-700">
                      Type: {selectedZone.type}
                    </div>
                  </div>
                )}
                
                {zones.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs font-medium text-gray-700 mb-2">
                      All Zones ({zones.length})
                    </div>
                    <div className="space-y-1">
                      {zones.map((zone) => (
                        <div
                          key={zone.id}
                          className={`p-2 rounded text-xs cursor-pointer transition-colors ${
                            selectedZoneId === zone.id
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedZoneId(zone.id!)}
                        >
                          <div className="font-medium">{zone.name}</div>
                          <div className="text-gray-500">{zone.type}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 p-6">
          <Card>
            <CardContent className="p-4">
              <div className="border-2 border-gray-200 rounded-lg bg-white overflow-hidden relative">
                <canvas ref={canvasRef} className="max-w-full" />
                
                {pages.length === 0 && (
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
              </div>
              
              {currentPage && (
                <div className="mt-4 text-sm text-gray-600 text-center">
                  Page {currentPage.page_number} • {currentPage.pdf_page_width} × {currentPage.pdf_page_height} pt
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalTemplateEditor;
