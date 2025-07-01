import React, { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Rect, Text as FabricText } from "fabric";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TemplatePage } from "@/services/types/templateTypes";
import TemplateCanvasToolbar from "./TemplateCanvasToolbar";
import TemplateCanvasArea from "./TemplateCanvasArea";
import TemplateCanvasPlaceholder from "./TemplateCanvasPlaceholder";
import ZonePropertiesPanel from "./ZonePropertiesPanel";
import { PDFRenderer } from "@/utils/pdfRenderer";
import { 
  saveZoneToDatabase,
  loadZonesForPage,
  updateZoneAssignment,
  deleteZone,
  ZoneWithAssignment
} from "@/services/zonePersistenceService";
import { createZoneGroup } from "./utils/zoneUtils";

interface CleanTemplateCanvasProps {
  activePage?: TemplatePage;
  templateId?: string;
  templateDimensions?: {
    width: number;
    height: number;
    units: string;
  };
}

const CleanTemplateCanvas: React.FC<CleanTemplateCanvasProps> = ({
  activePage,
  templateId,
  templateDimensions
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [pdfRenderer, setPdfRenderer] = useState<PDFRenderer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [zones, setZones] = useState<ZoneWithAssignment[]>([]);

  const canvasDims = getCanvasDimensions(templateDimensions);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: canvasDims.width,
      height: canvasDims.height,
      backgroundColor: "#f8f9fa",
      selection: true,
      preserveObjectStacking: true,
    });

    // Add selection event listener
    canvas.on('selection:created', (e) => {
      setSelectedZone(e.selected?.[0] || null);
    });

    canvas.on('selection:updated', (e) => {
      setSelectedZone(e.selected?.[0] || null);
    });

    canvas.on('selection:cleared', () => {
      setSelectedZone(null);
    });

    setFabricCanvas(canvas);
    setCanvasReady(true);

    return () => {
      canvas.dispose();
    };
  }, [templateDimensions]);

  // Initialize PDF renderer
  useEffect(() => {
    const renderer = new PDFRenderer();
    setPdfRenderer(renderer);

    return () => {
      renderer.destroy();
    };
  }, []);

  // Load page content when activePage changes
  useEffect(() => {
    if (!fabricCanvas || !activePage || !canvasReady) return;

    loadPageContent();
  }, [fabricCanvas, activePage, canvasReady, templateDimensions]);

  const loadPageContent = async () => {
    if (!fabricCanvas || !activePage) return;

    setIsLoading(true);
    fabricCanvas.clear();

    try {
      // Load existing zones first
      await loadExistingZones();

      // Try to load PDF preview or render from original PDF
      if (activePage.preview_image_url) {
        console.log('[CleanCanvas] Loading preview image:', activePage.preview_image_url);
        await loadPreviewImage();
      } else {
        console.log('[CleanCanvas] No preview image, attempting PDF rendering');
        await renderPDFPage();
      }
    } catch (error) {
      console.error('[CleanCanvas] Error loading page content:', error);
      createPlaceholderBackground();
    } finally {
      setIsLoading(false);
    }
  };

  const loadExistingZones = async () => {
    if (!activePage || !fabricCanvas) return;

    try {
      const loadedZones = await loadZonesForPage(activePage.id);
      setZones(loadedZones);

      // Render zones on canvas
      loadedZones.forEach(zone => {
        const zoneGroup = createZoneGroup({
          name: zone.name,
          type: zone.type,
          x: zone.x,
          y: zone.y,
          width: zone.width,
          height: zone.height,
          zIndex: zone.z_index || 0,
          zoneId: zone.id,
        });

        fabricCanvas.add(zoneGroup);
      });

      fabricCanvas.renderAll();
    } catch (error) {
      console.error('[CleanCanvas] Error loading zones:', error);
    }
  };

  const renderPDFPage = async () => {
    if (!pdfRenderer || !activePage || !pdfCanvasRef.current || !fabricCanvas) return;

    try {
      // Get the template's original PDF URL
      const { data: template } = await supabase
        .from('templates')
        .select('original_pdf_url')
        .eq('id', activePage.template_id)
        .single();

      if (!template?.original_pdf_url) {
        throw new Error('No original PDF URL found');
      }

      console.log('[CleanCanvas] Rendering PDF page from:', template.original_pdf_url);
      
      await pdfRenderer.loadPDF(template.original_pdf_url);
      await pdfRenderer.renderPageToCanvas(
        activePage.page_number,
        pdfCanvasRef.current,
        { scale: 1.0 }
      );

      // Convert PDF canvas to Fabric.js image
      const pdfImageUrl = pdfCanvasRef.current.toDataURL();
      const { Image: FabricImage } = await import('fabric');
      const pdfImage = await FabricImage.fromURL(pdfImageUrl);
      
      // Scale to fit canvas
      const scale = Math.min(
        canvasDims.width / pdfImage.width!,
        canvasDims.height / pdfImage.height!
      );
      
      pdfImage.set({
        left: 0,
        top: 0,
        scaleX: scale,
        scaleY: scale,
        selectable: false,
        evented: false,
      });

      fabricCanvas.add(pdfImage);
      fabricCanvas.sendObjectToBack(pdfImage);
      fabricCanvas.renderAll();

      toast.success(`PDF page ${activePage.page_number} rendered successfully`);
    } catch (error) {
      console.error('[CleanCanvas] PDF rendering failed:', error);
      createPlaceholderBackground();
    }
  };

  const loadPreviewImage = async () => {
    if (!fabricCanvas || !activePage?.preview_image_url) return;

    const { Image: FabricImage } = await import('fabric');
    const img = await FabricImage.fromURL(activePage.preview_image_url);
    
    const scale = Math.min(
      canvasDims.width / img.width!,
      canvasDims.height / img.height!
    );
    
    img.set({
      left: 0,
      top: 0,
      scaleX: scale,
      scaleY: scale,
      selectable: false,
      evented: false,
    });

    fabricCanvas.add(img);
    fabricCanvas.sendObjectToBack(img);
    fabricCanvas.renderAll();
  };

  const createPlaceholderBackground = () => {
    if (!fabricCanvas || !activePage) return;

    const bgRect = new Rect({
      left: 0,
      top: 0,
      width: canvasDims.width,
      height: canvasDims.height,
      fill: '#ffffff',
      stroke: '#e5e7eb',
      strokeWidth: 2,
      selectable: false,
      evented: false,
    });

    const titleText = new FabricText(`Page ${activePage.page_number}`, {
      left: canvasDims.width / 2,
      top: 50,
      fontSize: 24,
      fill: '#374151',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontWeight: 'bold',
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
    });

    fabricCanvas.add(bgRect);
    fabricCanvas.add(titleText);
    fabricCanvas.renderAll();
  };

  const addImageZone = () => {
    if (!fabricCanvas) return;

    const zoneCount = zones.length + 1;
    const name = `Image Zone ${zoneCount}`;
    
    const zoneGroup = createZoneGroup({
      name,
      type: 'image',
      x: 100 + (zoneCount % 3) * 220,
      y: 150 + Math.floor(zoneCount / 3) * 180,
      width: 200,
      height: 150,
      zIndex: zoneCount
    });

    fabricCanvas.add(zoneGroup);
    fabricCanvas.setActiveObject(zoneGroup);
    fabricCanvas.renderAll();

    toast.success(`Added ${name}`);
  };

  const addTextZone = () => {
    if (!fabricCanvas) return;

    const zoneCount = zones.length + 1;
    const name = `Text Zone ${zoneCount}`;
    
    const zoneGroup = createZoneGroup({
      name,
      type: 'text',
      x: 350 + (zoneCount % 3) * 220,
      y: 200 + Math.floor(zoneCount / 3) * 80,
      width: 300,
      height: 50,
      zIndex: zoneCount
    });

    fabricCanvas.add(zoneGroup);
    fabricCanvas.setActiveObject(zoneGroup);
    fabricCanvas.renderAll();

    toast.success(`Added ${name}`);
  };

  const handleZoneSave = async () => {
    if (!selectedZone || !activePage || !templateId) return;

    const customProps = selectedZone.get('customProps');
    
    const zoneData = {
      template_id: templateId,
      name: customProps?.name || 'Unnamed Zone',
      type: customProps?.zoneType || 'image',
      x: selectedZone.left || 0,
      y: selectedZone.top || 0,
      width: selectedZone.width || 100,
      height: selectedZone.height || 100,
      z_index: customProps?.zIndex || 0
    };

    const zoneId = await saveZoneToDatabase(zoneData, activePage.id);
    
    if (zoneId) {
      // Update the zone's custom properties with the new ID
      selectedZone.set('customProps', {
        ...customProps,
        zoneId
      });
      
      // Reload zones to get the complete data
      await loadExistingZones();
    }
  };

  const handleZoneUpdate = async (properties: any) => {
    // Real-time updates are handled in ZonePropertiesPanel
    // This could be used for additional validation or processing
  };

  const handleZoneDelete = async () => {
    if (!selectedZone) return;

    const customProps = selectedZone.get('customProps');
    const zoneId = customProps?.zoneId;
    
    if (zoneId) {
      const zone = zones.find(z => z.id === zoneId);
      const success = await deleteZone(zoneId, zone?.pageAssignment?.id);
      
      if (success) {
        fabricCanvas?.remove(selectedZone);
        fabricCanvas?.renderAll();
        setSelectedZone(null);
        await loadExistingZones();
      }
    } else {
      // Zone not saved yet, just remove from canvas
      fabricCanvas?.remove(selectedZone);
      fabricCanvas?.renderAll();
      setSelectedZone(null);
      toast.success('Zone removed');
    }
  };

  if (!activePage) {
    return <TemplateCanvasPlaceholder templateDimensions={templateDimensions} />;
  }

  return (
    <div className="space-y-4">
      <TemplateCanvasToolbar
        onAddImageZone={addImageZone}
        onAddTextZone={addTextZone}
        templateDimensions={templateDimensions}
      />
      
      <div className="flex gap-4">
        <div className="flex-1">
          <TemplateCanvasArea
            canvasRef={canvasRef}
            canvasDimensions={canvasDims}
            isLoading={isLoading}
            templateDimensions={templateDimensions}
          />
        </div>
        
        <div className="w-80">
          <ZonePropertiesPanel
            selectedZone={selectedZone}
            templateDimensions={templateDimensions}
            onZoneUpdate={handleZoneUpdate}
            onZoneDelete={handleZoneDelete}
            onZoneSave={handleZoneSave}
          />
        </div>
      </div>

      {/* Hidden PDF rendering canvas */}
      <canvas 
        ref={pdfCanvasRef} 
        style={{ display: 'none' }} 
      />
    </div>
  );
};

// Helper function (keeping existing implementation)
const getCanvasDimensions = (templateDimensions?: {
  width: number;
  height: number;
  units: string;
}) => {
  if (!templateDimensions) {
    return { width: 800, height: 600 };
  }

  const pixelsPerUnit = templateDimensions.units === 'in' ? 72 : 2.83;
  const templateWidthPx = templateDimensions.width * pixelsPerUnit;
  const templateHeightPx = templateDimensions.height * pixelsPerUnit;
  
  const maxWidth = 1000;
  const maxHeight = 700;
  
  const scale = Math.min(
    maxWidth / templateWidthPx,
    maxHeight / templateHeightPx,
    1
  );
  
  return {
    width: Math.round(templateWidthPx * scale),
    height: Math.round(templateHeightPx * scale)
  };
};

export default CleanTemplateCanvas;
