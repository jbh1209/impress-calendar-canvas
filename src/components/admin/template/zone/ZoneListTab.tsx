
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
    <div className="space-y-1 h-full flex flex-col">
      <div className="flex justify-between items-center flex-shrink-0">
        <Label className="text-2xs font-medium leading-none">Zones</Label>
        <Button 
          size="sm" 
          onClick={onSaveZones}
          className="h-4 text-2xs px-1"
          disabled={isLoading}
        >
          <Save className="h-2 w-2 mr-0.5" />
          Save
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="space-y-0.5">
          {zones.map((zone, idx) => (
            <ZoneListItem
              key={idx}
              zone={zone}
              isSelected={selectedZone === zone}
              onClick={() => onZoneSelect(zone)}
            />
          ))}
          
          {zones.length === 0 && (
            <div className="text-center text-gray-500 text-2xs py-1">
              No zones created
            </div>
          )}
        </div>
      </div>
      
      {selectedZone && (
        <div className="flex gap-0.5 pt-0.5 border-t flex-shrink-0">
          <Button size="sm" variant="outline" className="h-4 text-2xs px-0.5 flex-1">
            <Copy className="h-2 w-2 mr-0.5" />
            Copy
          </Button>
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={onDeleteZone}
            className="h-4 text-2xs px-0.5"
          >
            <Trash2 className="h-2 w-2" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ZoneListTab;
