
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Image, Type } from "lucide-react";

interface ZoneListItemProps {
  zone: any;
  isSelected: boolean;
  onClick: () => void;
}

const ZoneListItem: React.FC<ZoneListItemProps> = ({
  zone,
  isSelected,
  onClick
}) => {
  const props = zone.get('customProps' as any);
  
  return (
    <div 
      className={`flex items-center justify-between p-1.5 rounded border text-xs cursor-pointer ${
        isSelected ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 hover:bg-gray-100'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        {props?.zoneType === 'image' ? 
          <Image className="h-3 w-3 flex-shrink-0" /> : 
          <Type className="h-3 w-3 flex-shrink-0" />
        }
        <span className="truncate text-xs">{props?.name || 'Zone'}</span>
      </div>
      <div className="flex items-center gap-1">
        <Badge variant="outline" className="text-xs px-1 py-0">
          {props?.zoneType}
        </Badge>
      </div>
    </div>
  );
};

export default ZoneListItem;
