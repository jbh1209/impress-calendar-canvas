import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PDFRenderer } from "@/utils/pdfRenderer";

interface TemplatePageEditorProps {
  page: {
    id: string;
    page_number: number;
    pdf_page_width: number;
    pdf_page_height: number;
    pdf_units: string;
  };
  pdfUrl: string;
  templateId: string;
}

interface Zone {
  id?: string;
  name: string;
  type: 'image' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  is_repeating: boolean;
}

const TemplatePageEditor = ({ page, pdfUrl, templateId }: TemplatePageEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfRenderer] = useState(() => new PDFRenderer());
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentZone, setCurrentZone] = useState<Zone | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [scale, setScale] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);

  // New zone form data
  const [newZone, setNewZone] = useState<Omit<Zone, 'x' | 'y' | 'width' | 'height'>>({
    name: '',
    type: 'image',
    is_repeating: false
  });

  useEffect(() => {
    loadPDF();
    fetchZones();
    
    return () => {
      pdfRenderer.destroy();
    };
  }, [page, pdfUrl]);

  const loadPDF = async () => {
    if (!canvasRef.current) return;

    try {
      await pdfRenderer.loadPDF(pdfUrl);
      
      // Calculate scale to fit container
      const container = containerRef.current;
      if (container) {
        const containerWidth = container.clientWidth - 40; // padding
        const scaleToFit = containerWidth / page.pdf_page_width;
        setScale(Math.min(scaleToFit, 1.5));
      }

      await pdfRenderer.renderPageToCanvas(
        page.page_number,
        canvasRef.current,
        { scale }
      );
      
      setIsLoaded(true);
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast.error("Failed to load PDF page");
    }
  };

  const fetchZones = async () => {
    try {
      const { data, error } = await supabase
        .from('zone_page_assignments')
        .select(`
          id, x, y, width, height, is_repeating,
          customization_zones!inner(id, name, type)
        `)
        .eq('page_id', page.id);

      if (error) throw error;

      const zonesData = data?.map(assignment => ({
        id: assignment.customization_zones.id,
        name: assignment.customization_zones.name,
        type: assignment.customization_zones.type as 'image' | 'text',
        x: assignment.x,
        y: assignment.y,
        width: assignment.width,
        height: assignment.height,
        is_repeating: assignment.is_repeating
      })) || [];

      setZones(zonesData);
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (!newZone.name.trim()) {
      toast.error("Please enter a zone name first");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    setIsDrawing(true);
    setCurrentZone({
      ...newZone,
      x,
      y,
      width: 0,
      height: 0
    });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !currentZone) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = (e.clientX - rect.left) / scale;
    const currentY = (e.clientY - rect.top) / scale;

    setCurrentZone(prev => prev ? {
      ...prev,
      width: Math.abs(currentX - prev.x),
      height: Math.abs(currentY - prev.y),
      x: Math.min(prev.x, currentX),
      y: Math.min(prev.y, currentY)
    } : null);
  };

  const handleCanvasMouseUp = () => {
    if (!isDrawing || !currentZone) return;

    if (currentZone.width < 10 || currentZone.height < 10) {
      toast.error("Zone is too small. Minimum size is 10x10 pixels");
      setIsDrawing(false);
      setCurrentZone(null);
      return;
    }

    saveZone(currentZone);
    setIsDrawing(false);
    setCurrentZone(null);
  };

  const saveZone = async (zone: Zone) => {
    try {
      // Create zone in customization_zones table
      const { data: zoneData, error: zoneError } = await supabase
        .from('customization_zones')
        .insert({
          template_id: templateId,
          name: zone.name,
          type: zone.type,
          x: 0, // Template-level position (not used for page-specific zones)
          y: 0,
          width: 0,
          height: 0
        })
        .select()
        .single();

      if (zoneError) throw zoneError;

      // Create page assignment
      const { error: assignmentError } = await supabase
        .from('zone_page_assignments')
        .insert({
          zone_id: zoneData.id,
          page_id: page.id,
          x: zone.x,
          y: zone.y,
          width: zone.width,
          height: zone.height,
          is_repeating: zone.is_repeating
        });

      if (assignmentError) throw assignmentError;

      toast.success("Zone created successfully");
      fetchZones();
      
      // Reset form
      setNewZone({
        name: '',
        type: 'image',
        is_repeating: false
      });

    } catch (error) {
      console.error('Error saving zone:', error);
      toast.error("Failed to save zone");
    }
  };

  const deleteZone = async (zone: Zone) => {
    if (!zone.id) return;

    try {
      const { error } = await supabase
        .from('customization_zones')
        .delete()
        .eq('id', zone.id);

      if (error) throw error;

      toast.success("Zone deleted");
      fetchZones();
      setSelectedZone(null);
    } catch (error) {
      console.error('Error deleting zone:', error);
      toast.error("Failed to delete zone");
    }
  };

  const drawZones = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear previous overlays
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Re-render PDF
    pdfRenderer.renderPageToCanvas(page.page_number, canvas, { scale });

    // Draw existing zones
    zones.forEach(zone => {
      ctx.strokeStyle = selectedZone?.id === zone.id ? '#3b82f6' : '#ef4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        zone.x * scale,
        zone.y * scale,
        zone.width * scale,
        zone.height * scale
      );

      // Zone label
      ctx.fillStyle = selectedZone?.id === zone.id ? '#3b82f6' : '#ef4444';
      ctx.font = '12px Arial';
      ctx.fillText(
        zone.name,
        zone.x * scale + 4,
        zone.y * scale - 4
      );
    });

    // Draw current zone being created
    if (currentZone) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        currentZone.x * scale,
        currentZone.y * scale,
        currentZone.width * scale,
        currentZone.height * scale
      );
      ctx.setLineDash([]);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      drawZones();
    }
  }, [zones, currentZone, selectedZone, scale, isLoaded]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Page {page.page_number} - Zone Editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Zone Creation Form */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <Label htmlFor="zoneName">Zone Name</Label>
              <Input
                id="zoneName"
                value={newZone.name}
                onChange={(e) => setNewZone(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Logo Area"
              />
            </div>
            <div>
              <Label htmlFor="zoneType">Type</Label>
              <Select
                value={newZone.type}
                onValueChange={(value: 'image' | 'text') => setNewZone(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="repeating"
                checked={newZone.is_repeating}
                onCheckedChange={(checked) => setNewZone(prev => ({ ...prev, is_repeating: !!checked }))}
              />
              <Label htmlFor="repeating">Repeat on all pages</Label>
            </div>
            <div className="pt-6">
              <p className="text-sm text-muted-foreground">
                Fill in the details above, then click and drag on the PDF to create a zone.
              </p>
            </div>
          </div>

          {/* PDF Canvas */}
          <div ref={containerRef} className="border rounded-lg overflow-auto">
            <canvas
              ref={canvasRef}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              className="cursor-crosshair max-w-full"
              style={{ 
                width: page.pdf_page_width * scale,
                height: page.pdf_page_height * scale
              }}
            />
          </div>

          {/* Zone List */}
          {zones.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Zones on this page ({zones.length})</h4>
              <div className="space-y-2">
                {zones.map(zone => (
                  <div
                    key={zone.id}
                    className={`flex items-center justify-between p-2 border rounded-lg cursor-pointer ${
                      selectedZone?.id === zone.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedZone(selectedZone?.id === zone.id ? null : zone)}
                  >
                    <div>
                      <span className="font-medium">{zone.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({zone.type}) {Math.round(zone.width)}×{Math.round(zone.height)}px
                        {zone.is_repeating && ' • Repeating'}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteZone(zone);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplatePageEditor;