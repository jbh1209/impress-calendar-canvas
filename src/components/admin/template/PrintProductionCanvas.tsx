import React, { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Rect, Text as FabricText, Line } from "fabric";
import { toast } from "sonner";
import { TemplatePage } from "@/services/types/templateTypes";
import { PDFProcessor } from "@/utils/pdfProcessor";
import { CoordinateSystem, type Dimensions } from "@/utils/coordinateSystem";
import { 
  saveZoneToDatabase,
  loadZonesForPage,
  updateZoneAssignment,
  deleteZone,
  ZoneWithAssignment
} from "@/services/zonePersistenceService";
import { createZoneGroup } from "./utils/zoneUtils";
import ProfessionalZoneEditor from "./ProfessionalZoneEditor";
import TemplateCanvasToolbar from "./TemplateCanvasToolbar";
import TemplateCanvasArea from "./TemplateCanvasArea";

interface PrintProductionCanvasProps {
  activePage?: TemplatePage;
  templateId?: string;
  templateDimensions?: Dimensions;
  originalPdfUrl?: string;
}

const PrintProductionCanvas: React.FC<PrintProductionCanvasProps> = ({
  activePage,
  templateId,
  templateDimensions,
  originalPdfUrl
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [pdfProcessor, setPdfProcessor] = useState<PDFProcessor | null>(null);
  const [coordinateSystem, setCoordinateSystem] = useState<CoordinateSystem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [zones, setZones] = useState<ZoneWithAssignment[]>([]);
  const [dimensionMismatch, setDimensionMismatch] = useState(false);

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

    // Add selection event listeners
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

  // Initialize PDF processor
  useEffect(() => {
    const processor = new PDFProcessor();
    setPdfProcessor(processor);

    return () => {
      processor.destroy();
    };
  }, []);

  // Load page content when activePage changes
  useEffect(() => {
    if (!fabricCanvas || !activePage || !canvasReady) return;

    loadPageContent();
  }, [fabricCanvas, activePage, canvasReady, templateDimensions, originalPdfUrl]);

  const loadPageContent = async () => {
    if (!fabricCanvas || !activePage || !pdfProcessor) return;

    setIsLoading(true);
    fabricCanvas.clear();

    try {
      // Load existing zones first
      await loadExistingZones();

      // Load PDF if available
      if (originalPdfUrl) {
        console.log('[PrintCanvas] Loading PDF:', originalPdfUrl);
        const result = await pdfProcessor.loadPDF(originalPdfUrl);
        
        if (result.success && result.pages.length > 0) {
          const pageInfo = result.pages[activePage.page_number - 1];
          
          // Create coordinate system
          if (templateDimensions) {
            const coordSystem = new CoordinateSystem(
              canvasDims.width,
              canvasDims.height,
              pageInfo.width,
              pageInfo.height,
              templateDimensions
            );
            setCoordinateSystem(coordSystem);
            
            // Check for dimension mismatch
            setDimensionMismatch(!coordSystem.dimensionsMatch(0.05));
          }

          // Render PDF to canvas
          if (pdfCanvasRef.current) {
            const success = await pdfProcessor.renderPageToCanvas(
              activePage.page_number,
              pdfCanvasRef.current,
              canvasDims.width,
              canvasDims.height
            );

            if (success) {
              await loadPdfToFabric();
              addPrintGuides();
            }
          }
        } else {
          throw new Error(result.error || 'Failed to load PDF');
        }
      } else {
        createPlaceholderBackground();
      }
    } catch (error) {
      console.error('[PrintCanvas] Error loading page content:', error);
      createPlaceholderBackground();
      toast.error('Failed to load PDF content');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPdfToFabric = async () => {
    if (!pdfCanvasRef.current || !fabricCanvas) return;

    const pdfImageUrl = pdfCanvasRef.current.toDataURL();
    const { Image: FabricImage } = await import('fabric');
    const pdfImage = await FabricImage.fromURL(pdfImageUrl);
    
    pdfImage.set({
      left: 0,
      top: 0,
      selectable: false,
      evented: false,
      name: 'pdf-background'
    });

    fabricCanvas.add(pdfImage);
    fabricCanvas.sendObjectToBack(pdfImage);
    fabricCanvas.renderAll();
  };

  const addPrintGuides = () => {
    if (!fabricCanvas || !templateDimensions) return;

    // Add trim lines (using template dimensions)
    const trimColor = '#ff0000';
    const safeColor = '#00ff00';
    const bleedColor = '#0000ff';

    // Trim lines (outer boundary of finished piece)
    const trimLines = [
      // Top
      new Line([0, 0, canvasDims.width, 0], {
        stroke: trimColor,
        strokeWidth: 1,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
        name: 'trim-guide'
      }),
      // Bottom
      new Line([0, canvasDims.height, canvasDims.width, canvasDims.height], {
        stroke: trimColor,
        strokeWidth: 1,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
        name: 'trim-guide'
      }),
      // Left
      new Line([0, 0, 0, canvasDims.height], {
        stroke: trimColor,
        strokeWidth: 1,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
        name: 'trim-guide'
      }),
      // Right
      new Line([canvasDims.width, 0, canvasDims.width, canvasDims.height], {
        stroke: trimColor,
        strokeWidth: 1,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
        name: 'trim-guide'
      })
    ];

    trimLines.forEach(line => fabricCanvas.add(line));
    fabricCanvas.renderAll();
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
      console.error('[PrintCanvas] Error loading zones:', error);
    }
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

    const warningText = new FabricText('PDF not loaded - Upload a PDF file', {
      left: canvasDims.width / 2,
      top: canvasDims.height - 50,
      fontSize: 14,
      fill: '#ef4444',
      fontFamily: 'Inter, system-ui, sans-serif',
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
    });

    fabricCanvas.add(bgRect);
    fabricCanvas.add(titleText);
    fabricCanvas.add(warningText);
    fabricCanvas.renderAll();
  };

  const addImageZone = () => {
    if (!fabricCanvas) return;

    const zoneCount = zones.length + 1;
    const name = `Image Zone ${zoneCount}`;
    
    const zoneGroup = createZoneGroup({
      name,
      type: 'image',
      x: 50 + (zoneCount % 3) * 150,
      y: 100 + Math.floor(zoneCount / 3) * 120,
      width: 120,
      height: 90,
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
      x: 200 + (zoneCount % 3) * 150,
      y: 150 + Math.floor(zoneCount / 3) * 60,
      width: 180,
      height: 40,
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
      selectedZone.set('customProps', {
        ...customProps,
        zoneId
      });
      
      await loadExistingZones();
    }
  };

  const handleZoneUpdate = async (properties: any) => {
    // Real-time updates are handled in the zone editor
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
      fabricCanvas?.remove(selectedZone);
      fabricCanvas?.renderAll();
      setSelectedZone(null);
      toast.success('Zone removed');
    }
  };

  if (!activePage) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="text-gray-500 mb-2">No page selected</div>
          <div className="text-sm text-gray-400">Select a page to start editing zones</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Dimension Mismatch Warning */}
      {dimensionMismatch && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2 text-amber-800 text-sm font-medium">
            ⚠️ Dimension Mismatch Detected
          </div>
          <div className="text-xs text-amber-700 mt-1">
            The uploaded PDF dimensions don't match your template settings. 
            Zones may not align correctly in the final print.
          </div>
        </div>
      )}

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
          <ProfessionalZoneEditor
            selectedZone={selectedZone}
            coordinateSystem={coordinateSystem}
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

// Helper function for canvas dimensions
const getCanvasDimensions = (templateDimensions?: Dimensions) => {
  if (!templateDimensions) {
    return { width: 800, height: 600 };
  }

  // Convert template dimensions to pixels for display
  const pixelsPerMm = 3.78; // 96 DPI
  const pixelsPerIn = 96;
  
  let widthPx: number;
  let heightPx: number;
  
  switch (templateDimensions.unit) {
    case 'mm':
      widthPx = templateDimensions.width * pixelsPerMm;
      heightPx = templateDimensions.height * pixelsPerMm;
      break;
    case 'in':
      widthPx = templateDimensions.width * pixelsPerIn;
      heightPx = templateDimensions.height * pixelsPerIn;
      break;
    case 'pt':
      widthPx = templateDimensions.width * 1.33; // 96/72 DPI conversion
      heightPx = templateDimensions.height * 1.33;
      break;
    default:
      widthPx = templateDimensions.width;
      heightPx = templateDimensions.height;
  }
  
  // Scale to fit reasonable screen size
  const maxWidth = 1000;
  const maxHeight = 700;
  
  const scale = Math.min(
    maxWidth / widthPx,
    maxHeight / heightPx,
    1
  );
  
  return {
    width: Math.round(widthPx * scale),
    height: Math.round(heightPx * scale)
  };
};

export default PrintProductionCanvas;
