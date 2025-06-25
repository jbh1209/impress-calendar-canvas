
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
    <div className="p-1.5 border-b border-gray-200 bg-white flex-shrink-0">
      <div className="flex items-center gap-1 mb-0.5">
        <Layers className="h-2.5 w-2.5" />
        <h3 className="text-xs font-medium leading-tight">Zone Manager</h3>
      </div>
      <div className="flex items-center gap-1">
        <Badge variant="outline" className="text-xs px-1 py-0 h-4">
          P{activePage?.page_number || '?'}
        </Badge>
        <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
          {zoneCount}
        </Badge>
      </div>
    </div>
  );
};

export default AdvancedZoneManagerHeader;
