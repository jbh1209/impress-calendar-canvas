import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Canvas as FabricCanvas } from "fabric";
import { Image, Type, Copy, Trash2, Settings, Move, Save, Layers } from "lucide-react";
import { toast } from "sonner";
import { TemplatePage, ZonePageAssignment } from "@/services/types/templateTypes";
import { getZoneAssignmentsByPageId, saveZoneAssignments, createZoneAssignmentFromCanvas } from "@/services/zonePageAssignmentService";
import { createZoneGroup, canvasToVectorCoordinates, vectorToCanvasCoordinates } from "./utils/zoneUtils";

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

  const getZonesList = () => {
    if (!fabricCanvasRef.current) return [];
    
    return fabricCanvasRef.current.getObjects().filter(obj => 
      obj.get('customProps' as any)?.zoneType
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Compact Header */}
      <div className="p-2 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-1.5 mb-1">
          <Layers className="h-3 w-3" />
          <h3 className="text-xs font-medium">Zone Manager</h3>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-xs px-1 py-0">
            Page {activePage?.page_number || '?'}
          </Badge>
          <Badge variant="secondary" className="text-xs px-1 py-0">
            {zoneAssignments.length} zones
          </Badge>
        </div>
      </div>

      {/* Compact Content */}
      <div className="flex-1 overflow-y-auto p-2">
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-6 text-xs">
            <TabsTrigger value="create" className="text-xs py-1">Create</TabsTrigger>
            <TabsTrigger value="manage" className="text-xs py-1">Manage</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-2 mt-2">
            <div>
              <Label htmlFor="zone-name" className="text-xs">Zone Name</Label>
              <Input
                id="zone-name"
                placeholder="Zone name..."
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                className="h-6 text-xs"
              />
            </div>
            
            <div>
              <Label className="text-xs">Type</Label>
              <Select value={zoneType} onValueChange={(value: 'image' | 'text') => setZoneType(value)}>
                <SelectTrigger className="h-6 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-1.5">
              <Switch
                id="repeating"
                checked={isRepeating}
                onCheckedChange={setIsRepeating}
                className="scale-75"
              />
              <Label htmlFor="repeating" className="text-xs">Repeat all pages</Label>
            </div>
            
            <div className="flex gap-1">
              <Button 
                size="sm" 
                onClick={() => handleAddZone('image')}
                className="flex-1 h-6 text-xs px-2"
              >
                <Image className="h-2.5 w-2.5 mr-1" />
                Image
              </Button>
              <Button 
                size="sm" 
                onClick={() => handleAddZone('text')}
                className="flex-1 h-6 text-xs px-2"
              >
                <Type className="h-2.5 w-2.5 mr-1" />
                Text
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="manage" className="space-y-2 mt-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-medium">Zones</Label>
              <Button 
                size="sm" 
                onClick={handleSaveZones}
                className="h-5 text-xs px-2"
                disabled={isLoading}
              >
                <Save className="h-2.5 w-2.5 mr-1" />
                Save
              </Button>
            </div>
            
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {getZonesList().map((obj, idx) => {
                const props = obj.get('customProps' as any);
                return (
                  <div 
                    key={idx}
                    className={`flex items-center justify-between p-1.5 rounded border text-xs cursor-pointer ${
                      selectedZone === obj ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      setSelectedZone(obj);
                      fabricCanvasRef.current?.setActiveObject(obj);
                    }}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      {props?.zoneType === 'image' ? 
                        <Image className="h-2.5 w-2.5 flex-shrink-0" /> : 
                        <Type className="h-2.5 w-2.5 flex-shrink-0" />
                      }
                      <span className="truncate text-xs">{props?.name || 'Zone'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {props?.zoneType}
                      </Badge>
                    </div>
                  </div>
                );
              })}
              
              {getZonesList().length === 0 && (
                <div className="text-center text-gray-500 text-xs py-3">
                  No zones created
                </div>
              )}
            </div>
            
            {selectedZone && (
              <div className="flex gap-1 pt-1 border-t">
                <Button size="sm" variant="outline" className="h-5 text-xs px-2 flex-1">
                  <Copy className="h-2.5 w-2.5 mr-1" />
                  Duplicate
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={handleDeleteZone}
                  className="h-5 text-xs px-2"
                >
                  <Trash2 className="h-2.5 w-2.5" />
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdvancedZoneManager;
