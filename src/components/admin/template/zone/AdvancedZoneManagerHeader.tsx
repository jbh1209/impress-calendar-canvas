
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
    <div className="p-1 border-b border-gray-200 bg-white flex-shrink-0">
      <div className="flex items-center gap-0.5 mb-0.5">
        <Layers className="h-2 w-2" />
        <h3 className="text-2xs font-medium leading-none">Zone Manager</h3>
      </div>
      <div className="flex items-center gap-0.5">
        <Badge variant="outline" className="text-2xs px-0.5 py-0 h-3">
          P{activePage?.page_number || '?'}
        </Badge>
        <Badge variant="secondary" className="text-2xs px-0.5 py-0 h-3">
          {zoneCount}
        </Badge>
      </div>
    </div>
  );
};

export default AdvancedZoneManagerHeader;
