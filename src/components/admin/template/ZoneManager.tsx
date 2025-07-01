
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Canvas as FabricCanvas } from "fabric";
import { Image, Type, Copy, Trash2, Settings } from "lucide-react";
import { toast } from "sonner";
import { createZoneGroup } from "./utils/zoneUtils";

interface ZoneManagerProps {
  fabricCanvasRef: React.MutableRefObject<FabricCanvas | null>;
  activePage?: any;
}

const ZoneManager: React.FC<ZoneManagerProps> = ({ fabricCanvasRef, activePage }) => {
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [zoneName, setZoneName] = useState("");
  const [zoneType, setZoneType] = useState<'image' | 'text'>('image');

  const handleAddZone = (type: 'image' | 'text') => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    const zoneCount = canvas.getObjects().filter(obj => 
      obj.get('customProps' as any)?.zoneType === type
    ).length + 1;
    
    const name = zoneName || `${type.charAt(0).toUpperCase() + type.slice(1)} Zone ${zoneCount}`;
    
    // Create zone with vector-aware dimensions
    const defaultWidth = type === 'image' ? 200 : 150;
    const defaultHeight = type === 'image' ? 150 : 40;
    
    // Position zones in a grid pattern to avoid overlap
    const gridX = 50 + (zoneCount % 4) * (defaultWidth + 20);
    const gridY = 50 + Math.floor(zoneCount / 4) * (defaultHeight + 30);
    
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Zone Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Zone */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="zone-name" className="text-xs">Zone Name (optional)</Label>
            <Input
              id="zone-name"
              placeholder="Enter zone name..."
              value={zoneName}
              onChange={(e) => setZoneName(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          
          <div>
            <Label className="text-xs">Zone Type</Label>
            <Select value={zoneType} onValueChange={(value: 'image' | 'text') => setZoneType(value)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Image Zone</SelectItem>
                <SelectItem value="text">Text Zone</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => handleAddZone('image')}
              className="flex-1 h-8 text-xs"
            >
              <Image className="h-3 w-3 mr-1" />
              Add Image
            </Button>
            <Button 
              size="sm" 
              onClick={() => handleAddZone('text')}
              className="flex-1 h-8 text-xs"
            >
              <Type className="h-3 w-3 mr-1" />
              Add Text
            </Button>
          </div>
        </div>

        {/* Zones List */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Current Zones</Label>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {getZonesList().map((obj, idx) => {
              const props = obj.get('customProps' as any);
              return (
                <div 
                  key={idx}
                  className={`flex items-center justify-between p-2 rounded border text-xs ${
                    selectedZone === obj ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                  }`}
                  onClick={() => setSelectedZone(obj)}
                >
                  <div className="flex items-center gap-2">
                    {props?.zoneType === 'image' ? 
                      <Image className="h-3 w-3" /> : 
                      <Type className="h-3 w-3" />
                    }
                    <span>{props?.name || 'Unnamed Zone'}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {props?.zoneType}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Zone Actions */}
        {selectedZone && (
          <div className="flex gap-2 pt-2 border-t">
            <Button size="sm" variant="outline" className="h-7 text-xs">
              <Copy className="h-3 w-3 mr-1" />
              Duplicate
            </Button>
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={handleDeleteZone}
              className="h-7 text-xs"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ZoneManager;
