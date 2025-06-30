import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Upload, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Canvas as FabricCanvas, Rect, Text as FabricText } from "fabric";
import { supabase } from "@/integrations/supabase/client";

interface BleedSettings {
  top: number;
  right: number;
  bottom: number;
  left: number;
  units: string;
}

interface Template {
  id?: string;
  name: string;
  description: string;
  category: string;
  dimensions: string;
  is_active: boolean;
  bleed_settings: BleedSettings;
  original_pdf_url?: string;
  pdf_metadata?: any;
}

interface TemplatePage {
  id: string;
  template_id: string;
  page_number: number;
  preview_image_url: string | null;
  pdf_page_width: number | null;
  pdf_page_height: number | null;
  pdf_units: string | null;
}

const CleanTemplateEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");

  // Template state
  const [template, setTemplate] = useState<Template>({
    name: "",
    description: "",
    category: "calendar",
    dimensions: "210x297mm",
    is_active: false,
    bleed_settings: {
      top: 3,
      right: 3,
      bottom: 3,
      left: 3,
      units: "mm"
    }
  });

  // Pages state
  const [pages, setPages] = useState<TemplatePage[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const currentPage = pages[currentPageIndex];

  const isCreateMode = !id || id === 'create';

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: "#f8fafc",
      selection: true,
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  // Load template if editing
  useEffect(() => {
    if (id && id !== 'create') {
      loadTemplate(id);
      loadPages(id);
    }
  }, [id]);

  // Update canvas when page changes
  useEffect(() => {
    if (currentPage && fabricCanvas) {
      updateCanvas();
    }
  }, [currentPage, fabricCanvas]);

  const loadTemplate = async (templateId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', templateId)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast.error('Template not found');
        navigate('/admin/templates');
        return;
      }

      // Properly type cast the bleed_settings JSON to BleedSettings interface
      const defaultBleedSettings: BleedSettings = {
        top: 3,
        right: 3,
        bottom: 3,
        left: 3,
        units: "mm"
      };

      let bleedSettings: BleedSettings = defaultBleedSettings;
      
      if (data.bleed_settings && typeof data.bleed_settings === 'object' && data.bleed_settings !== null) {
        const settings = data.bleed_settings as any;
        bleedSettings = {
          top: typeof settings.top === 'number' ? settings.top : 3,
          right: typeof settings.right === 'number' ? settings.right : 3,
          bottom: typeof settings.bottom === 'number' ? settings.bottom : 3,
          left: typeof settings.left === 'number' ? settings.left : 3,
          units: typeof settings.units === 'string' ? settings.units : "mm"
        };
      }

      setTemplate({
        id: data.id,
        name: data.name,
        description: data.description || "",
        category: data.category,
        dimensions: data.dimensions || "210x297mm",
        is_active: data.is_active,
        bleed_settings: bleedSettings,
        original_pdf_url: data.original_pdf_url,
        pdf_metadata: data.pdf_metadata
      });
    } catch (error) {
      console.error('Error loading template:', error);
      toast.error('Failed to load template');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPages = async (templateId: string) => {
    try {
      const { data, error } = await supabase
        .from('template_pages')
        .select('*')
        .eq('template_id', templateId)
        .order('page_number');

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Error loading pages:', error);
      toast.error('Failed to load template pages');
    }
  };

  const updateCanvas = () => {
    if (!fabricCanvas || !currentPage) return;

    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#f8fafc";

    if (currentPage.preview_image_url) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = fabricCanvas.getElement();
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Scale image to fit canvas
          const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * 0.9;
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const x = (canvas.width - scaledWidth) / 2;
          const y = (canvas.height - scaledHeight) / 2;
          
          ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
          fabricCanvas.renderAll();
        }
      };
      img.onerror = () => {
        console.error('Failed to load preview image');
        createPlaceholder();
      };
      img.src = currentPage.preview_image_url;
    } else {
      createPlaceholder();
    }
  };

  const createPlaceholder = () => {
    if (!fabricCanvas || !currentPage) return;

    const titleText = new FabricText(`Page ${currentPage.page_number}`, {
      left: 400,
      top: 250,
      fontSize: 32,
      fill: '#374151',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
    });

    const dimensionText = new FabricText(
      `${Math.round(currentPage.pdf_page_width || 0)} × ${Math.round(currentPage.pdf_page_height || 0)} ${currentPage.pdf_units || 'pt'}`,
      {
        left: 400,
        top: 300,
        fontSize: 18,
        fill: '#6b7280',
        fontFamily: 'Arial',
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
      }
    );

    fabricCanvas.add(titleText);
    fabricCanvas.add(dimensionText);
    fabricCanvas.renderAll();
  };

  const handleSave = async () => {
    if (!template.name.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast.error("You must be logged in to save templates");
        return;
      }

      const templateData = {
        name: template.name.trim(),
        description: template.description.trim() || null,
        category: template.category,
        dimensions: template.dimensions,
        is_active: template.is_active,
        bleed_settings: template.bleed_settings,
        created_by: user.id
      };

      let result;
      if (isCreateMode) {
        result = await supabase
          .from('templates')
          .insert([templateData])
          .select()
          .single();
      } else {
        result = await supabase
          .from('templates')
          .update(templateData)
          .eq('id', template.id!)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      toast.success(isCreateMode ? "Template created successfully!" : "Template updated successfully!");
      
      if (isCreateMode) {
        navigate(`/admin/templates/edit/${result.data.id}`);
      } else {
        setTemplate(prev => ({ ...prev, ...result.data }));
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!template.name.trim()) {
      toast.error("Please enter a template name first");
      return;
    }

    // Save template first if it doesn't exist
    let templateId = template.id;
    if (!templateId) {
      await handleSave();
      // Get the ID from the current template state after save
      const { data: savedTemplate } = await supabase
        .from('templates')
        .select('id')
        .eq('name', template.name)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (!savedTemplate) {
        toast.error("Failed to save template first");
        return;
      }
      templateId = savedTemplate.id;
    }

    setIsProcessing(true);
    setProcessingStatus('Uploading PDF...');

    try {
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("template_id", templateId);

      const { data, error } = await supabase.functions.invoke('split-pdf', {
        body: formData,
      });

      if (error) {
        console.error("Upload error:", error);
        toast.error(`Upload failed: ${error.message}`);
        return;
      }

      if (!data?.success) {
        toast.error(data?.message || 'PDF processing failed');
        return;
      }

      toast.success(data.message);
      await loadPages(templateId);
      if (data.pages && data.pages.length > 0) {
        setCurrentPageIndex(0);
      }
    } catch (error) {
      console.error("PDF upload error:", error);
      toast.error('Failed to process PDF');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const addTextZone = () => {
    if (!fabricCanvas) return;

    const zone = new Rect({
      left: 100,
      top: 100,
      width: 200,
      height: 50,
      fill: 'rgba(16, 185, 129, 0.1)',
      stroke: '#10b981',
      strokeWidth: 2,
      strokeDashArray: [5, 5],
    });

    const label = new FabricText('Text Zone', {
      left: 200,
      top: 125,
      fontSize: 14,
      fill: '#10b981',
      fontFamily: 'Arial',
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
    });

    fabricCanvas.add(zone);
    fabricCanvas.add(label);
    fabricCanvas.setActiveObject(zone);
    fabricCanvas.renderAll();
    toast.success('Text zone added');
  };

  const addImageZone = () => {
    if (!fabricCanvas) return;

    const zone = new Rect({
      left: 350,
      top: 100,
      width: 150,
      height: 150,
      fill: 'rgba(59, 130, 246, 0.1)',
      stroke: '#3b82f6',
      strokeWidth: 2,
      strokeDashArray: [5, 5],
    });

    const label = new FabricText('Image Zone', {
      left: 425,
      top: 175,
      fontSize: 14,
      fill: '#3b82f6',
      fontFamily: 'Arial',
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
    });

    fabricCanvas.add(zone);
    fabricCanvas.add(label);
    fabricCanvas.setActiveObject(zone);
    fabricCanvas.renderAll();
    toast.success('Image zone added');
  };

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
          
          <Button onClick={handleSave} disabled={!template.name.trim() || isLoading}>
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
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={template.name}
                  onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter template name"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={template.description}
                  onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={template.category}
                  onValueChange={(value) => setTemplate(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="calendar">Calendar</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="dimensions">Dimensions</Label>
                <Input
                  id="dimensions"
                  value={template.dimensions}
                  onChange={(e) => setTemplate(prev => ({ ...prev, dimensions: e.target.value }))}
                  placeholder="e.g., 210x297mm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Bleed Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Bleed Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Top</Label>
                  <Input
                    type="number"
                    value={template.bleed_settings.top}
                    onChange={(e) => setTemplate(prev => ({
                      ...prev,
                      bleed_settings: { ...prev.bleed_settings, top: parseFloat(e.target.value) || 0 }
                    }))}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Right</Label>
                  <Input
                    type="number"
                    value={template.bleed_settings.right}
                    onChange={(e) => setTemplate(prev => ({
                      ...prev,
                      bleed_settings: { ...prev.bleed_settings, right: parseFloat(e.target.value) || 0 }
                    }))}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Bottom</Label>
                  <Input
                    type="number"
                    value={template.bleed_settings.bottom}
                    onChange={(e) => setTemplate(prev => ({
                      ...prev,
                      bleed_settings: { ...prev.bleed_settings, bottom: parseFloat(e.target.value) || 0 }
                    }))}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Left</Label>
                  <Input
                    type="number"
                    value={template.bleed_settings.left}
                    onChange={(e) => setTemplate(prev => ({
                      ...prev,
                      bleed_settings: { ...prev.bleed_settings, left: parseFloat(e.target.value) || 0 }
                    }))}
                    className="text-sm"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-xs">Units</Label>
                <Select
                  value={template.bleed_settings.units}
                  onValueChange={(value) => setTemplate(prev => ({
                    ...prev,
                    bleed_settings: { ...prev.bleed_settings, units: value }
                  }))}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mm">mm</SelectItem>
                    <SelectItem value="in">in</SelectItem>
                    <SelectItem value="pt">pt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* PDF Upload */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">PDF Upload</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="pdf-upload">Upload PDF</Label>
                <Input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfUpload}
                  disabled={isProcessing}
                />
              </div>
              
              {isProcessing && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {processingStatus}
                </div>
              )}
              
              {pages.length > 0 && (
                <div>
                  <Label className="text-xs">Pages ({pages.length})</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {pages.map((page, index) => (
                      <Button
                        key={page.id}
                        variant={index === currentPageIndex ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPageIndex(index)}
                        className="text-xs"
                      >
                        {page.page_number}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Zone Tools */}
          {pages.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Add Zones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button onClick={addTextZone} variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Text Zone
                </Button>
                <Button onClick={addImageZone} variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Image Zone
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 p-6">
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <div className="border-2 border-gray-200 rounded-lg bg-white overflow-hidden flex justify-center">
                  <canvas 
                    ref={canvasRef} 
                    className="max-w-full"
                    style={{ 
                      width: 800,
                      height: 600
                    }}
                  />
                </div>
                
                {isProcessing && (
                  <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
                    <div className="text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      <div className="text-sm text-gray-600">{processingStatus}</div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Canvas Info */}
              <div className="mt-2 text-xs text-gray-500 text-center">
                Canvas: 800 × 600 px • Template: {template.dimensions}
                {currentPage && (
                  <span className="ml-2">
                    • Page {currentPage.page_number} of {pages.length}
                    {currentPage.pdf_page_width && currentPage.pdf_page_height && (
                      <span className="ml-2">
                        ({Math.round(currentPage.pdf_page_width)} × {Math.round(currentPage.pdf_page_height)} {currentPage.pdf_units || 'pt'})
                      </span>
                    )}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CleanTemplateEditor;
