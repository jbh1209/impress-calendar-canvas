
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Save, Copy, Trash2 } from "lucide-react";
import ZoneListItem from "./ZoneListItem";

interface ZoneListTabProps {
  zones: any[];
  selectedZone: any;
  onZoneSelect: (zone: any) => void;
  onSaveZones: () => void;
  onDeleteZone: () => void;
  isLoading: boolean;
}

const ZoneListTab: React.FC<ZoneListTabProps> = ({
  zones,
  selectedZone,
  onZoneSelect,
  onSaveZones,
  onDeleteZone,
  isLoading
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="text-xs font-medium">Zones</Label>
        <Button 
          size="sm" 
          onClick={onSaveZones}
          className="h-6 text-xs px-2"
          disabled={isLoading}
        >
          <Save className="h-3 w-3 mr-1" />
          Save
        </Button>
      </div>
      
      <div className="space-y-1 max-h-32 overflow-y-auto">
        {zones.map((zone, idx) => (
          <ZoneListItem
            key={idx}
            zone={zone}
            isSelected={selectedZone === zone}
            onClick={() => onZoneSelect(zone)}
          />
        ))}
        
        {zones.length === 0 && (
          <div className="text-center text-gray-500 text-xs py-3">
            No zones created
          </div>
        )}
      </div>
      
      {selectedZone && (
        <div className="flex gap-1 pt-1 border-t">
          <Button size="sm" variant="outline" className="h-6 text-xs px-2 flex-1">
            <Copy className="h-3 w-3 mr-1" />
            Duplicate
          </Button>
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={onDeleteZone}
            className="h-6 text-xs px-2"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ZoneListTab;
