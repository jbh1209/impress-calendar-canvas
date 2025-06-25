import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Canvas as FabricCanvas } from "fabric";
import { toast } from "sonner";
import { TemplatePage, ZonePageAssignment } from "@/services/types/templateTypes";
import { getZoneAssignmentsByPageId, saveZoneAssignments } from "@/services/zonePageAssignmentService";
import { createZoneGroup, canvasToVectorCoordinates, vectorToCanvasCoordinates } from "./utils/zoneUtils";
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
  const [zoneAssignments, setZoneAssignments] = useState<ZonePageAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activePage?.id) {
      loadZoneAssignments();
    }
  }, [activePage?.id]);

  const loadZoneAssignments = async () => {
    if (!activePage?.id) return;
    
    setIsLoading(true);
    try {
      const assignments = await getZoneAssignmentsByPageId(activePage.id);
      setZoneAssignments(assignments);
      
      if (fabricCanvasRef.current && assignments.length > 0) {
        renderZoneAssignments(assignments);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderZoneAssignments = (assignments: ZonePageAssignment[]) => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    
    const existingZones = canvas.getObjects().filter(obj => 
      obj.get('customProps' as any)?.zoneType
    );
    existingZones.forEach(zone => canvas.remove(zone));
    
    assignments.forEach((assignment, index) => {
      let canvasX = assignment.x;
      let canvasY = assignment.y;
      let canvasWidth = assignment.width;
      let canvasHeight = assignment.height;
      
      if (activePage?.pdf_page_width && activePage?.pdf_page_height) {
        const canvasCoords = vectorToCanvasCoordinates(
          assignment.x,
          assignment.y,
          activePage.pdf_page_width,
          activePage.pdf_page_height,
          canvas.width || 800,
          canvas.height || 600
        );
        
        const canvasDims = vectorToCanvasCoordinates(
          assignment.width,
          assignment.height,
          activePage.pdf_page_width,
          activePage.pdf_page_height,
          canvas.width || 800,
          canvas.height || 600
        );
        
        canvasX = canvasCoords.x;
        canvasY = canvasCoords.y;
        canvasWidth = canvasDims.x;
        canvasHeight = canvasDims.y;
      }
      
      const zoneGroup = createZoneGroup({
        name: `Zone ${index + 1}`,
        type: assignment.is_repeating ? 'text' : 'image',
        x: canvasX,
        y: canvasY,
        width: canvasWidth,
        height: canvasHeight,
        zIndex: assignment.z_index,
        zoneId: assignment.id
      });
      
      canvas.add(zoneGroup);
    });
    
    canvas.renderAll();
  };

  const handleAddZone = (type: 'image' | 'text') => {
    if (!fabricCanvasRef.current || !activePage) return;
    
    const canvas = fabricCanvasRef.current;
    const zoneCount = canvas.getObjects().filter(obj => 
      obj.get('customProps' as any)?.zoneType === type
    ).length + 1;
    
    const name = zoneName || `${type.charAt(0).toUpperCase() + type.slice(1)} Zone ${zoneCount}`;
    
    const defaultWidth = type === 'image' ? 150 : 120;
    const defaultHeight = type === 'image' ? 100 : 30;
    
    const gridX = 30 + (zoneCount % 3) * (defaultWidth + 15);
    const gridY = 30 + Math.floor(zoneCount / 3) * (defaultHeight + 20);
    
    try {
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
      toast.success(`Added ${type} zone: ${name}`);
    } catch (error) {
      console.error("Error adding zone:", error);
      toast.error("Failed to add zone");
    }
  };

  const handleSaveZones = async () => {
    if (!fabricCanvasRef.current || !activePage) return;
    
    const canvas = fabricCanvasRef.current;
    const zones = canvas.getObjects().filter(obj => 
      obj.get('customProps' as any)?.zoneType
    );
    
    const assignments: Omit<ZonePageAssignment, 'id'>[] = zones.map((zone, index) => {
      let vectorX = zone.left || 0;
      let vectorY = zone.top || 0;
      let vectorWidth = zone.width || 100;
      let vectorHeight = zone.height || 100;
      
      if (activePage.pdf_page_width && activePage.pdf_page_height) {
        const vectorCoords = canvasToVectorCoordinates(
          zone.left || 0,
          zone.top || 0,
          canvas.width || 800,
          canvas.height || 600,
          activePage.pdf_page_width,
          activePage.pdf_page_height
        );
        
        const vectorDims = canvasToVectorCoordinates(
          zone.width || 100,
          zone.height || 100,
          canvas.width || 800,
          canvas.height || 600,
          activePage.pdf_page_width,
          activePage.pdf_page_height
        );
        
        vectorX = vectorCoords.x;
        vectorY = vectorCoords.y;
        vectorWidth = vectorDims.x;
        vectorHeight = vectorDims.y;
      }
      
      return {
        zone_id: 'temp_zone_' + index,
        page_id: activePage.id,
        x: vectorX,
        y: vectorY,
        width: vectorWidth,
        height: vectorHeight,
        z_index: index,
        is_repeating: isRepeating
      };
    });
    
    const success = await saveZoneAssignments(assignments, activePage.id);
    if (success) {
      await loadZoneAssignments();
    }
  };

  const handleDeleteZone = () => {
    if (!fabricCanvasRef.current || !selectedZone) return;
    
    const canvas = fabricCanvasRef.current;
    canvas.remove(selectedZone);
    canvas.renderAll();
    setSelectedZone(null);
    toast.success("Zone deleted");
  };

  const handleZoneSelect = (zone: any) => {
    setSelectedZone(zone);
    fabricCanvasRef.current?.setActiveObject(zone);
  };

  const getZonesList = () => {
    if (!fabricCanvasRef.current) return [];
    
    return fabricCanvasRef.current.getObjects().filter(obj => 
      obj.get('customProps' as any)?.zoneType
    );
  };

  return (
    <div className="h-full flex flex-col">
      <AdvancedZoneManagerHeader 
        activePage={activePage}
        zoneCount={zoneAssignments.length}
      />

      <div className="flex-1 overflow-y-auto p-2">
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-7 text-xs">
            <TabsTrigger value="create" className="text-xs py-1">Create</TabsTrigger>
            <TabsTrigger value="manage" className="text-xs py-1">Manage</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-2 mt-2">
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
          
          <TabsContent value="manage" className="space-y-2 mt-2">
            <ZoneListTab
              zones={getZonesList()}
              selectedZone={selectedZone}
              onZoneSelect={handleZoneSelect}
              onSaveZones={handleSaveZones}
              onDeleteZone={handleDeleteZone}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdvancedZoneManager;
