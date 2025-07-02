import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Image, Type, Trash2 } from 'lucide-react';
import { Zone } from './types/templateTypes';

interface ZoneManagementPanelProps {
  zones: Zone[];
  selectedZone: Zone | null;
  onAddZone: (type: 'image' | 'text') => void;
  onZoneSelect: (zone: Zone) => void;
  onUpdateZone: (updates: Partial<Zone>) => void;
  onDeleteZone: (zoneId: string) => void;
}

const ZoneManagementPanel: React.FC<ZoneManagementPanelProps> = ({
  zones,
  selectedZone,
  onAddZone,
  onZoneSelect,
  onUpdateZone,
  onDeleteZone
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Zone Editor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Zone Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onAddZone('image')} 
            className="flex-1"
          >
            <Image className="h-4 w-4 mr-2" />
            Image
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onAddZone('text')} 
            className="flex-1"
          >
            <Type className="h-4 w-4 mr-2" />
            Text
          </Button>
        </div>

        {/* Zone List */}
        {zones.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm">Zones</Label>
            {zones.map(zone => (
              <div
                key={zone.id}
                className={`flex items-center justify-between p-2 rounded border cursor-pointer ${
                  selectedZone?.id === zone.id ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                onClick={() => onZoneSelect(zone)}
              >
                <span className="text-sm">{zone.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteZone(zone.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Zone Properties */}
        {selectedZone && (
          <div className="space-y-3 pt-4 border-t">
            <Label className="text-sm">Zone Properties</Label>
            
            <div>
              <Label htmlFor="zone-name" className="text-xs">Name</Label>
              <Input
                id="zone-name"
                value={selectedZone.name}
                onChange={(e) => onUpdateZone({ name: e.target.value })}
                className="h-8"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="zone-x" className="text-xs">X</Label>
                <Input
                  id="zone-x"
                  type="number"
                  value={Math.round(selectedZone.x || 0)}
                  onChange={(e) => onUpdateZone({ x: parseInt(e.target.value) || 0 })}
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="zone-y" className="text-xs">Y</Label>
                <Input
                  id="zone-y"
                  type="number"
                  value={Math.round(selectedZone.y || 0)}
                  onChange={(e) => onUpdateZone({ y: parseInt(e.target.value) || 0 })}
                  className="h-8"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="zone-width" className="text-xs">Width</Label>
                <Input
                  id="zone-width"
                  type="number"
                  value={Math.round(selectedZone.width || 0)}
                  onChange={(e) => onUpdateZone({ width: parseInt(e.target.value) || 0 })}
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="zone-height" className="text-xs">Height</Label>
                <Input
                  id="zone-height"
                  type="number"
                  value={Math.round(selectedZone.height || 0)}
                  onChange={(e) => onUpdateZone({ height: parseInt(e.target.value) || 0 })}
                  className="h-8"
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ZoneManagementPanel;