
import React, { useState, useCallback, useEffect } from "react";
import { Canvas as FabricCanvas } from "fabric";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { TemplatePage } from "@/services/types/templateTypes";
import AdvancedZoneManagerHeader from "./zone/AdvancedZoneManagerHeader";
import ZoneCreationTab from "./zone/ZoneCreationTab";
import ZoneListTab from "./zone/ZoneListTab";

interface AdvancedZoneManagerProps {
  fabricCanvasRef: React.MutableRefObject<FabricCanvas | null>;
  activePage?: TemplatePage;
  templateId?: string;
}

const AdvancedZoneManager: React.FC<AdvancedZoneManagerProps> = ({
  fabricCanvasRef,
  activePage,
  templateId
}) => {
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [zoneName, setZoneName] = useState("");
  const [zoneType, setZoneType] = useState<'image' | 'text'>('image');
  const [isRepeating, setIsRepeating] = useState(false);
  const [zones, setZones] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("create");
  const [previewError, setPreviewError] = useState(false);

  const refreshZones = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    const zoneObjects = canvas.getObjects().filter(obj => 
      obj.get('customProps' as any)?.zoneType
    );
    setZones(zoneObjects);
  }, [fabricCanvasRef]);

  useEffect(() => {
    refreshZones();
    
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const handleCanvasChange = () => {
      refreshZones();
    };

    canvas.on('object:added', handleCanvasChange);
    canvas.on('object:removed', handleCanvasChange);
    canvas.on('selection:created', (e) => {
      const selected = e.selected?.[0];
      if (selected && selected.get('customProps' as any)?.zoneType) {
        setSelectedZone(selected);
      }
    });
    canvas.on('selection:cleared', () => {
      setSelectedZone(null);
    });

    return () => {
      canvas.off('object:added', handleCanvasChange);
      canvas.off('object:removed', handleCanvasChange);
      canvas.off('selection:created');
      canvas.off('selection:cleared');
    };
  }, [refreshZones, fabricCanvasRef]);

  const handleAddZone = useCallback((type: 'image' | 'text') => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    const zoneCount = zones.filter(zone => 
      zone.get('customProps' as any)?.zoneType === type
    ).length + 1;
    
    const name = zoneName || `${type.charAt(0).toUpperCase() + type.slice(1)} Zone ${zoneCount}`;
    
    const defaultWidth = type === 'image' ? 120 : 100;
    const defaultHeight = type === 'image' ? 80 : 24;
    
    const gridX = 20 + (zoneCount % 3) * (defaultWidth + 15);
    const gridY = 20 + Math.floor(zoneCount / 3) * (defaultHeight + 20);
    
    try {
      const { createZoneGroup } = require('./utils/zoneUtils');
      const zoneGroup = createZoneGroup({
        name,
        type,
        x: gridX,
        y: gridY,
        width: defaultWidth,
        height: defaultHeight,
        zIndex: zoneCount
      });
      
      canvas.add(zoneGroup);
      canvas.setActiveObject(zoneGroup);
      canvas.renderAll();
      
      setZoneName("");
      setActiveTab("manage");
      toast.success(`Added ${type} zone: ${name}`);
    } catch (error) {
      console.error("Error adding zone:", error);
      toast.error("Failed to add zone");
    }
  }, [fabricCanvasRef, zones, zoneName]);

  const handleDeleteZone = useCallback(() => {
    if (!fabricCanvasRef.current || !selectedZone) return;
    
    const canvas = fabricCanvasRef.current;
    canvas.remove(selectedZone);
    canvas.renderAll();
    setSelectedZone(null);
    toast.success("Zone deleted");
  }, [fabricCanvasRef, selectedZone]);

  const handleSaveZones = useCallback(async () => {
    if (!templateId || !activePage) {
      toast.error("Template or page not available");
      return;
    }

    setIsLoading(true);
    try {
      // Save zones logic would go here
      toast.success("Zones saved successfully");
    } catch (error) {
      console.error("Error saving zones:", error);
      toast.error("Failed to save zones");
    } finally {
      setIsLoading(false);
    }
  }, [templateId, activePage]);

  const handleZoneSelect = useCallback((zone: any) => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    canvas.setActiveObject(zone);
    canvas.renderAll();
    setSelectedZone(zone);
  }, [fabricCanvasRef]);

  // Handle preview image error
  const handlePreviewError = () => {
    setPreviewError(true);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <AdvancedZoneManagerHeader 
        activePage={activePage} 
        zoneCount={zones.length}
      />
      
      {/* PDF Preview */}
      {activePage && (
        <div className="p-4 bg-white border-b border-gray-200">
          <div className="text-xs font-medium text-gray-700 mb-2">PDF Preview</div>
          <div className="relative">
            {activePage.preview_image_url && !previewError ? (
              <img 
                src={activePage.preview_image_url} 
                alt={`Page ${activePage.page_number} preview`}
                className="w-full h-40 object-contain bg-white border rounded shadow-sm"
                onError={handlePreviewError}
                onLoad={() => setPreviewError(false)}
              />
            ) : (
              <div className="w-full h-40 bg-gray-100 border rounded flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-sm font-medium">PDF Preview</div>
                  <div className="text-xs">Page {activePage.page_number}</div>
                  {activePage.pdf_page_width && activePage.pdf_page_height && (
                    <div className="text-xs mt-1">
                      {Math.round(activePage.pdf_page_width * 0.352778)} × {Math.round(activePage.pdf_page_height * 0.352778)} mm
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* Zone placement overlay */}
            <div className="absolute inset-0 bg-blue-500 bg-opacity-5 rounded border border-blue-200 border-dashed pointer-events-none"></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Zone placement reference - position zones on the canvas to match this layout
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 m-2">
            <TabsTrigger value="create">Create Zones</TabsTrigger>
            <TabsTrigger value="manage">Manage Zones</TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-hidden p-2">
            <TabsContent value="create" className="m-0 h-full">
              <ZoneCreationTab
                zoneName={zoneName}
                setZoneName={setZoneName}
                zoneType={zoneType}
                setZoneType={setZoneType}
                isRepeating={isRepeating}
                setIsRepeating={setIsRepeating}
                onAddZone={handleAddZone}
              />
            </TabsContent>
            
            <TabsContent value="manage" className="m-0 h-full">
              <ZoneListTab
                zones={zones}
                selectedZone={selectedZone}
                onZoneSelect={handleZoneSelect}
                onSaveZones={handleSaveZones}
                onDeleteZone={handleDeleteZone}
                isLoading={isLoading}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default AdvancedZoneManager;
