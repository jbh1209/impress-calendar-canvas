import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Image, Type } from 'lucide-react';

interface Zone {
  id: string;
  name: string;
  type: 'image' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ZoneEditorProps {
  activePage: any;
}

const ZoneEditor: React.FC<ZoneEditorProps> = ({ activePage }) => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  const addZone = (type: 'image' | 'text') => {
    const newZone: Zone = {
      id: `zone-${Date.now()}`,
      name: `${type === 'image' ? 'Image' : 'Text'} Zone ${zones.length + 1}`,
      type,
      x: 50,
      y: 50,
      width: 100,
      height: type === 'text' ? 30 : 100,
    };
    
    setZones([...zones, newZone]);
    setSelectedZone(newZone);
  };

  const updateZone = (updates: Partial<Zone>) => {
    if (!selectedZone) return;
    
    const updatedZone = { ...selectedZone, ...updates };
    setZones(zones.map(z => z.id === selectedZone.id ? updatedZone : z));
    setSelectedZone(updatedZone);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Zone Editor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Zone Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => addZone('image')}
            className="flex-1"
          >
            <Image className="h-4 w-4 mr-2" />
            Image Zone
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addZone('text')}
            className="flex-1"
          >
            <Type className="h-4 w-4 mr-2" />
            Text Zone
          </Button>
        </div>

        {/* Zone List */}
        {zones.length > 0 && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Zones on Page {activePage?.page_number}</Label>
            {zones.map((zone) => (
              <Button
                key={zone.id}
                variant={selectedZone?.id === zone.id ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start"
                onClick={() => setSelectedZone(zone)}
              >
                {zone.type === 'image' ? <Image className="h-4 w-4 mr-2" /> : <Type className="h-4 w-4 mr-2" />}
                {zone.name}
              </Button>
            ))}
          </div>
        )}

        {/* Zone Properties */}
        {selectedZone && (
          <div className="space-y-3 pt-4 border-t border-border">
            <Label className="text-xs text-muted-foreground">Zone Properties</Label>
            
            <div className="space-y-2">
              <Label htmlFor="zone-name" className="text-xs">Name</Label>
              <Input
                id="zone-name"
                value={selectedZone.name}
                onChange={(e) => updateZone({ name: e.target.value })}
                className="h-8 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="zone-x" className="text-xs">X (mm)</Label>
                <Input
                  id="zone-x"
                  type="number"
                  value={selectedZone.x}
                  onChange={(e) => updateZone({ x: parseFloat(e.target.value) || 0 })}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="zone-y" className="text-xs">Y (mm)</Label>
                <Input
                  id="zone-y"
                  type="number"
                  value={selectedZone.y}
                  onChange={(e) => updateZone({ y: parseFloat(e.target.value) || 0 })}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="zone-width" className="text-xs">Width (mm)</Label>
                <Input
                  id="zone-width"
                  type="number"
                  value={selectedZone.width}
                  onChange={(e) => updateZone({ width: parseFloat(e.target.value) || 0 })}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="zone-height" className="text-xs">Height (mm)</Label>
                <Input
                  id="zone-height"
                  type="number"
                  value={selectedZone.height}
                  onChange={(e) => updateZone({ height: parseFloat(e.target.value) || 0 })}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ZoneEditor;