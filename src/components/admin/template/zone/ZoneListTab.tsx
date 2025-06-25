
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
    <div className="space-y-1.5 h-full flex flex-col">
      <div className="flex justify-between items-center flex-shrink-0">
        <Label className="text-xs font-medium leading-tight">Zones</Label>
        <Button 
          size="sm" 
          onClick={onSaveZones}
          className="h-5 text-xs px-1.5"
          disabled={isLoading}
        >
          <Save className="h-2.5 w-2.5 mr-0.5" />
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
            <div className="text-center text-gray-500 text-xs py-2">
              No zones created
            </div>
          )}
        </div>
      </div>
      
      {selectedZone && (
        <div className="flex gap-0.5 pt-1 border-t flex-shrink-0">
          <Button size="sm" variant="outline" className="h-5 text-xs px-1 flex-1">
            <Copy className="h-2.5 w-2.5 mr-0.5" />
            Copy
          </Button>
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={onDeleteZone}
            className="h-5 text-xs px-1"
          >
            <Trash2 className="h-2.5 w-2.5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ZoneListTab;
