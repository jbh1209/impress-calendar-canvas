import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TemplateZoneListProps {
  pageId: string;
}

interface ZoneAssignment {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  is_repeating: boolean;
  customization_zones: {
    id: string;
    name: string;
    type: string;
  };
}

const TemplateZoneList = ({ pageId }: TemplateZoneListProps) => {
  const [zones, setZones] = useState<ZoneAssignment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchZones = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('zone_page_assignments')
        .select(`
          id, x, y, width, height, is_repeating,
          customization_zones!inner(id, name, type)
        `)
        .eq('page_id', pageId);

      if (error) throw error;
      setZones(data || []);
    } catch (error) {
      console.error('Error fetching zones:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteZone = async (assignment: ZoneAssignment) => {
    try {
      // Delete the zone assignment first
      const { error: assignmentError } = await supabase
        .from('zone_page_assignments')
        .delete()
        .eq('id', assignment.id);

      if (assignmentError) throw assignmentError;

      // Then delete the zone itself
      const { error: zoneError } = await supabase
        .from('customization_zones')
        .delete()
        .eq('id', assignment.customization_zones.id);

      if (zoneError) throw zoneError;

      toast.success("Zone deleted successfully");
      fetchZones();
    } catch (error) {
      console.error('Error deleting zone:', error);
      toast.error("Failed to delete zone");
    }
  };

  useEffect(() => {
    fetchZones();
  }, [pageId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Zones</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading zones...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Zones ({zones.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {zones.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No zones defined for this page. Use the editor above to create zones.
          </p>
        ) : (
          zones.map((assignment) => (
            <div
              key={assignment.id}
              className="p-3 border rounded-lg space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">
                    {assignment.customization_zones.name}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {assignment.customization_zones.type}
                    </Badge>
                    {assignment.is_repeating && (
                      <Badge variant="secondary" className="text-xs">
                        Repeating
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteZone(assignment)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Position: {Math.round(assignment.x)}, {Math.round(assignment.y)} • 
                Size: {Math.round(assignment.width)} × {Math.round(assignment.height)} px
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default TemplateZoneList;