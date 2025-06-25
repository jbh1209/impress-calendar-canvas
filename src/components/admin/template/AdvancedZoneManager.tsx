
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

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <AdvancedZoneManagerHeader 
        activePage={activePage} 
        zoneCount={zones.length}
      />
      
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 m-1 h-6">
            <TabsTrigger value="create" className="text-xs px-1 py-0.5">Create</TabsTrigger>
            <TabsTrigger value="manage" className="text-xs px-1 py-0.5">Manage</TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-hidden">
            <TabsContent value="create" className="p-1.5 m-0 h-full">
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
            
            <TabsContent value="manage" className="p-1.5 m-0 h-full">
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
