
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Save, ArrowLeft, Image, Text } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

// Mock data for template being edited
const mockTemplates = [
  { 
    id: 1, 
    name: "Professional Calendar", 
    description: "Clean, corporate design with customizable accent colors.",
    category: "Corporate",
    isActive: true,
    baseImageUrl: "https://placehold.co/600x400/darkblue/white?text=Professional+Calendar",
    dimensions: "11x8.5",
    createdAt: "2025-03-15T10:30:00Z",
    customizationZones: [
      { id: 1, name: "Header Logo", type: "image", x: 50, y: 50, width: 100, height: 50 },
      { id: 2, name: "Month Label", type: "text", x: 300, y: 50, width: 200, height: 50 },
      { id: 3, name: "Main Image", type: "image", x: 150, y: 150, width: 300, height: 200 }
    ]
  }
];

const TemplateEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<any>(null);
  const isEditing = id !== undefined;
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(true);
  
  const [template, setTemplate] = useState({
    name: "",
    description: "",
    category: "",
    isActive: false,
    dimensions: "11x8.5"
  });

  useEffect(() => {
    const loadFabric = async () => {
      try {
        // Dynamic import of fabric (would be installed)
        const { fabric } = await import("fabric");
        
        if (!canvasRef.current) return;
        
        const canvas = new fabric.Canvas(canvasRef.current, {
          width: 800,
          height: 600,
          backgroundColor: "#ffffff"
        });
        
        fabricCanvasRef.current = canvas;
        
        if (isEditing && id) {
          // Load template data
          const templateData = mockTemplates.find(t => t.id === parseInt(id));
          
          if (templateData) {
            setTemplate({
              name: templateData.name,
              description: templateData.description,
              category: templateData.category,
              isActive: templateData.isActive,
              dimensions: templateData.dimensions
            });
            
            // Load background image if available
            fabric.Image.fromURL(templateData.baseImageUrl, function(img) {
              canvas.setWidth(800);
              canvas.setHeight(600);
              
              img.scaleToWidth(canvas.width || 800);
              canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
              
              // Load customization zones
              templateData.customizationZones.forEach(zone => {
                const rect = new fabric.Rect({
                  left: zone.x,
                  top: zone.y,
                  width: zone.width,
                  height: zone.height,
                  fill: zone.type === 'image' ? 'rgba(0, 150, 255, 0.3)' : 'rgba(255, 150, 0, 0.3)',
                  stroke: zone.type === 'image' ? 'rgba(0, 150, 255, 1)' : 'rgba(255, 150, 0, 1)',
                  strokeWidth: 2,
                  rx: 5,
                  ry: 5,
                  selectable: true,
                  data: { zoneId: zone.id, zoneType: zone.type, name: zone.name }
                });
                
                // Add label to zone
                const text = new fabric.Text(zone.name, {
                  left: zone.x + zone.width / 2,
                  top: zone.y + zone.height / 2,
                  fontSize: 14,
                  originX: 'center',
                  originY: 'center',
                  fontWeight: 'bold',
                  selectable: false
                });
                
                const zoneGroup = new fabric.Group([rect, text], {
                  left: zone.x,
                  top: zone.y,
                  selectable: true,
                  hasControls: true,
                  data: { zoneId: zone.id, zoneType: zone.type, name: zone.name }
                });
                
                canvas.add(zoneGroup);
              });
            });
          }
        }
        
        setIsLoading(false);
        
      } catch (error) {
        console.error("Error loading Fabric.js:", error);
        toast.error("Failed to load template editor");
      }
    };
    
    loadFabric();
    
    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
      }
    };
  }, [id, isEditing]);
  
  const handleAddZone = (type: 'image' | 'text') => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    const zoneId = Date.now();
    const zoneName = type === 'image' ? `Image Zone ${zoneId}` : `Text Zone ${zoneId}`;
    
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: type === 'image' ? 200 : 150,
      height: type === 'image' ? 150 : 50,
      fill: type === 'image' ? 'rgba(0, 150, 255, 0.3)' : 'rgba(255, 150, 0, 0.3)',
      stroke: type === 'image' ? 'rgba(0, 150, 255, 1)' : 'rgba(255, 150, 0, 1)',
      strokeWidth: 2,
      rx: 5,
      ry: 5,
      selectable: true,
      data: { zoneId, zoneType: type, name: zoneName }
    });
    
    const text = new fabric.Text(zoneName, {
      fontSize: 14,
      originX: 'center',
      originY: 'center',
      left: rect.width! / 2,
      top: rect.height! / 2,
      fontWeight: 'bold',
      selectable: false
    });
    
    const group = new fabric.Group([rect, text], {
      left: 100,
      top: 100,
      selectable: true,
      hasControls: true,
      data: { zoneId, zoneType: type, name: zoneName }
    });
    
    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.renderAll();
    
    toast.success(`Added new ${type} zone`);
  };
  
  const handleSaveTemplate = () => {
    // In a real implementation, this would save the template data to Supabase
    toast.success(isEditing ? "Template updated successfully" : "Template created successfully");
    navigate("/admin/templates");
  };
  
  return (
    <div>
      <Breadcrumb className="mb-6">
        <BreadcrumbItem>
          <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/admin/templates">Templates</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{isEditing ? "Edit Template" : "Create Template"}</BreadcrumbPage>
        </BreadcrumbItem>
      </Breadcrumb>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/admin/templates")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">{isEditing ? "Edit Template" : "Create Template"}</h1>
        </div>
        <Button onClick={handleSaveTemplate}>
          <Save className="mr-2 h-4 w-4" />
          Save Template
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="border rounded-lg overflow-hidden">
                {isLoading ? (
                  <div className="w-full h-[600px] bg-gray-100 animate-pulse flex items-center justify-center">
                    Loading editor...
                  </div>
                ) : (
                  <div className="relative">
                    <canvas ref={canvasRef} className="border-0" />
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      <Button size="sm" onClick={() => handleAddZone('image')} className="flex gap-2 items-center">
                        <Image className="w-4 h-4" />
                        Add Image Zone
                      </Button>
                      <Button size="sm" onClick={() => handleAddZone('text')} className="flex gap-2 items-center">
                        <Text className="w-4 h-4" />
                        Add Text Zone
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4 w-full">
                  <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
                  <TabsTrigger value="dimensions" className="flex-1">Dimensions</TabsTrigger>
                  <TabsTrigger value="status" className="flex-1">Status</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Template Name</Label>
                      <Input 
                        id="name" 
                        value={template.name} 
                        onChange={(e) => setTemplate({...template, name: e.target.value})}
                        placeholder="Enter template name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        value={template.description} 
                        onChange={(e) => setTemplate({...template, description: e.target.value})}
                        placeholder="Describe the template"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select 
                        value={template.category} 
                        onValueChange={(value) => setTemplate({...template, category: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Corporate">Corporate</SelectItem>
                          <SelectItem value="Personal">Personal</SelectItem>
                          <SelectItem value="Nature">Nature</SelectItem>
                          <SelectItem value="Seasonal">Seasonal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="dimensions">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="dimensions">Template Size</Label>
                      <Select 
                        value={template.dimensions} 
                        onValueChange={(value) => setTemplate({...template, dimensions: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="11x8.5">Letter - Landscape (11" x 8.5")</SelectItem>
                          <SelectItem value="8.5x11">Letter - Portrait (8.5" x 11")</SelectItem>
                          <SelectItem value="12x12">Square (12" x 12")</SelectItem>
                          <SelectItem value="11x14">Poster (11" x 14")</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="status">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="active-status">Active Status</Label>
                        <p className="text-sm text-muted-foreground">Make this template available to customers</p>
                      </div>
                      <Switch 
                        id="active-status" 
                        checked={template.isActive} 
                        onCheckedChange={(checked) => setTemplate({...template, isActive: checked})}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;
