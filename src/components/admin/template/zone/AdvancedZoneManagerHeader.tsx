
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Layers } from "lucide-react";
import { TemplatePage } from "@/services/types/templateTypes";

interface AdvancedZoneManagerHeaderProps {
  activePage?: TemplatePage;
  zoneCount: number;
}

const AdvancedZoneManagerHeader: React.FC<AdvancedZoneManagerHeaderProps> = ({
  activePage,
  zoneCount
}) => {
  return (
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
          {zoneCount} zones
        </Badge>
      </div>
    </div>
  );
};

export default AdvancedZoneManagerHeader;
