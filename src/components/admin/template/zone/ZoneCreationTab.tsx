
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
    <div className="space-y-1.5">
      <div>
        <Label htmlFor="zone-name" className="text-xs leading-tight">Name</Label>
        <Input
          id="zone-name"
          placeholder="Zone name..."
          value={zoneName}
          onChange={(e) => setZoneName(e.target.value)}
          className="h-6 text-xs px-1.5"
        />
      </div>
      
      <div>
        <Label className="text-xs leading-tight">Type</Label>
        <Select value={zoneType} onValueChange={(value: 'image' | 'text') => setZoneType(value)}>
          <SelectTrigger className="h-6 text-xs px-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="text">Text</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-1">
        <Switch
          id="repeating"
          checked={isRepeating}
          onCheckedChange={setIsRepeating}
          className="scale-75"
        />
        <Label htmlFor="repeating" className="text-xs leading-tight">Repeat all pages</Label>
      </div>
      
      <div className="flex gap-1">
        <Button 
          size="sm" 
          onClick={() => onAddZone('image')}
          className="flex-1 h-6 text-xs px-1"
        >
          <Image className="h-2.5 w-2.5 mr-0.5" />
          Image
        </Button>
        <Button 
          size="sm" 
          onClick={() => onAddZone('text')}
          className="flex-1 h-6 text-xs px-1"
        >
          <Type className="h-2.5 w-2.5 mr-0.5" />
          Text
        </Button>
      </div>
    </div>
  );
};

export default ZoneCreationTab;
