
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Canvas as FabricCanvas, Rect, Text as FabricText } from "fabric";
import { uploadPdfAndCreatePages } from "@/utils/pdfUpload";
import { getTemplateById, saveTemplate } from "@/services/templateService";
import { getTemplatePages } from "@/services/templatePageService";
import type { Template, TemplatePage } from "@/services/types/templateTypes";

// Import panels
import TemplateDetailsForm from "./panels/TemplateDetailsForm";
import TemplateDimensionsPanel from "./panels/TemplateDimensionsPanel";
import TemplateBleedPanel from "./panels/TemplateBleedPanel";
import TemplatePdfUploadPanel from "./panels/TemplatePdfUploadPanel";
import TemplateZoneToolsPanel from "./panels/TemplateZoneToolsPanel";
import TemplateCanvasArea from "./panels/TemplateCanvasArea";

interface UITemplateState {
  name: string;
  description: string;
  category: string;
  dimensions: string;
  is_active: boolean;
  customWidth: number;
  customHeight: number;
  units: string;
}

interface BleedSettings {
  top: number;
  right: number;
  bottom: number;
  left: number;
  units: string;
}

const SimpleTemplateEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Template state
  const [template, setTemplate] = useState<UITemplateState>({
    name: '',
    description: '',
    category: 'calendar',
    dimensions: 'custom',
    is_active: false,
    customWidth: 210,
    customHeight: 297,
    units: 'mm'
  });

  // Bleed settings state
  const [bleed, setBleed] = useState<BleedSettings>({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    units: 'mm'
  });

  const [isBleedOpen, setIsBleedOpen] = useState(false);
  
  // PDF and pages state
  const [pages, setPages] = useState<TemplatePage[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  
  // Canvas state
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
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

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  // Load template and pages
  useEffect(() => {
    if (id && id !== 'create') {
      loadTemplate(id);
      loadTemplatePages(id);
    }
  }, [id]);

  // Update canvas when page changes
  useEffect(() => {
    if (currentPage && fabricCanvas) {
      updateCanvasBackground();
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
          dimensions: templateData.dimensions || 'custom',
          is_active: templateData.is_active,
          customWidth: 210,
          customHeight: 297,
          units: 'mm'
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

  const updateCanvasBackground = () => {
    if (!fabricCanvas || !currentPage) return;

    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#f8fafc";

    if (currentPage.preview_image_url) {
      // Try to load preview image
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
      `${Math.round(currentPage.pdf_page_width || 0)} × ${Math.round(currentPage.pdf_page_height || 0)} pt`,
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
          
          <Button onClick={handleSave} disabled={!template.name.trim()}>
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 p-6 space-y-6">
          <TemplateDetailsForm template={template} setTemplate={setTemplate} />
          
          <TemplateDimensionsPanel template={template} setTemplate={setTemplate} />
          
          <TemplateBleedPanel 
            bleed={bleed} 
            setBleed={setBleed}
            isBleedOpen={isBleedOpen}
            setIsBleedOpen={setIsBleedOpen}
          />
          
          <TemplatePdfUploadPanel
            isProcessingPdf={isProcessingPdf}
            processingStatus={processingStatus}
            pages={pages}
            currentPageIndex={currentPageIndex}
            setCurrentPageIndex={setCurrentPageIndex}
            onPdfUpload={handlePdfUpload}
          />
          
          <TemplateZoneToolsPanel
            pages={pages}
            onAddTextZone={addTextZone}
            onAddImageZone={addImageZone}
          />
        </div>

        {/* Main Canvas Area */}
        <TemplateCanvasArea
          canvasRef={canvasRef}
          template={template}
          currentPage={currentPage}
          pages={pages}
          isProcessingPdf={isProcessingPdf}
        />
      </div>
    </div>
  );
};

export default SimpleTemplateEditor;
