
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, Type, Trash2 } from "lucide-react";
import type { CustomizationZone } from "@/services/types/templateTypes";

interface ZoneManagementSectionProps {
  isCreateMode: boolean;
  zones: CustomizationZone[];
  selectedZoneId: string | null;
  setSelectedZoneId: (id: string | null) => void;
  onCreateZone: (type: 'text' | 'image') => void;
  onDeleteZone: () => void;
}

const ZoneManagementSection: React.FC<ZoneManagementSectionProps> = ({
  isCreateMode,
  zones,
  selectedZoneId,
  setSelectedZoneId,
  onCreateZone,
  onDeleteZone
}) => {
  if (isCreateMode) return null;

  const selectedZone = zones.find(z => z.id === selectedZoneId);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Customization Zones</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCreateZone('image')}
            className="w-full justify-start"
          >
            <Image className="h-3 w-3 mr-2" />
            Add Image Zone
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCreateZone('text')}
            className="w-full justify-start"
          >
            <Type className="h-3 w-3 mr-2" />
            Add Text Zone
          </Button>
        </div>
        
        {selectedZone && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">
                Selected: {selectedZone.name}
              </span>
              <Button
                size="sm"
                variant="destructive"
                onClick={onDeleteZone}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <div className="text-xs text-blue-700">
              Type: {selectedZone.type}
            </div>
          </div>
        )}
        
        {zones.length > 0 && (
          <div className="mt-4">
            <div className="text-xs font-medium text-gray-700 mb-2">
              All Zones ({zones.length})
            </div>
            <div className="space-y-1">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  className={`p-2 rounded text-xs cursor-pointer transition-colors ${
                    selectedZoneId === zone.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedZoneId(zone.id!)}
                >
                  <div className="font-medium">{zone.name}</div>
                  <div className="text-gray-500">{zone.type}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ZoneManagementSection;
