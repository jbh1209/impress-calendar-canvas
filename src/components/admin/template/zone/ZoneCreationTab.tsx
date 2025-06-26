
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Image, Type } from "lucide-react";

interface ZoneCreationTabProps {
  zoneName: string;
  setZoneName: (name: string) => void;
  zoneType: 'image' | 'text';
  setZoneType: (type: 'image' | 'text') => void;
  isRepeating: boolean;
  setIsRepeating: (repeating: boolean) => void;
  onAddZone: (type: 'image' | 'text') => void;
}

const ZoneCreationTab: React.FC<ZoneCreationTabProps> = ({
  zoneName,
  setZoneName,
  zoneType,
  setZoneType,
  isRepeating,
  setIsRepeating,
  onAddZone
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="zone-name" className="text-sm font-medium">Name</Label>
        <Input
          id="zone-name"
          placeholder="Zone name..."
          value={zoneName}
          onChange={(e) => setZoneName(e.target.value)}
          className="h-9 text-sm mt-1"
        />
      </div>
      
      <div>
        <Label className="text-sm font-medium">Type</Label>
        <Select value={zoneType} onValueChange={(value: 'image' | 'text') => setZoneType(value)}>
          <SelectTrigger className="h-9 text-sm mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="text">Text</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="repeating"
          checked={isRepeating}
          onCheckedChange={setIsRepeating}
        />
        <Label htmlFor="repeating" className="text-sm">Repeat all pages</Label>
      </div>
      
      <div className="flex gap-2">
        <Button 
          size="sm" 
          onClick={() => onAddZone('image')}
          className="flex-1 h-9 text-sm"
        >
          <Image className="h-4 w-4 mr-2" />
          Image
        </Button>
        <Button 
          size="sm" 
          onClick={() => onAddZone('text')}
          className="flex-1 h-9 text-sm"
        >
          <Type className="h-4 w-4 mr-2" />
          Text
        </Button>
      </div>
    </div>
  );
};

export default ZoneCreationTab;
