
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Canvas as FabricCanvas } from "fabric";
import { TemplatePage } from "@/services/types/templateTypes";
import { Type, Image, Edit3, Trash2 } from "lucide-react";

export interface CustomerZoneEditorProps {
  activePage?: TemplatePage;
  customizations: any[];
  onZoneUpdate: (zoneId: string, updates: any) => void;
  fabricCanvasRef: React.MutableRefObject<FabricCanvas | null>;
}

const CustomerZoneEditor: React.FC<CustomerZoneEditorProps> = ({
  activePage,
  customizations,
  onZoneUpdate,
  fabricCanvasRef
}) => {
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [editingContent, setEditingContent] = useState("");
  const [editingType, setEditingType] = useState<"text" | "image">("text");

  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    
    // Listen for object selection on canvas
    const handleSelection = () => {
      const activeObject = canvas.getActiveObject();
      if (activeObject && activeObject.data?.zoneId) {
        const zoneId = activeObject.data.zoneId;
        const customization = customizations.find(c => c.zoneId === zoneId);
        setSelectedZone({ zoneId, ...customization });
        setEditingContent(customization?.content || "");
        setEditingType(customization?.type || "text");
      } else {
        setSelectedZone(null);
      }
    };

    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', () => setSelectedZone(null));

    return () => {
      canvas.off('selection:created', handleSelection);
      canvas.off('selection:updated', handleSelection);
      canvas.off('selection:cleared');
    };
  }, [customizations, fabricCanvasRef]);

  const handleContentUpdate = () => {
    if (!selectedZone) return;

    onZoneUpdate(selectedZone.zoneId, {
      type: editingType,
      content: editingContent,
      x: selectedZone.x || 0,
      y: selectedZone.y || 0,
      width: selectedZone.width || 100,
      height: selectedZone.height || 50
    });

    // Update the canvas object
    if (fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;
      const activeObject = canvas.getActiveObject();
      if (activeObject && editingType === "text") {
        activeObject.set('text', editingContent);
        canvas.renderAll();
      }
    }
  };

  const handleRemoveCustomization = () => {
    if (!selectedZone) return;
    
    // Remove from customizations by setting content to empty
    onZoneUpdate(selectedZone.zoneId, {
      type: editingType,
      content: "",
      x: selectedZone.x || 0,
      y: selectedZone.y || 0,
      width: selectedZone.width || 100,
      height: selectedZone.height || 50
    });

    // Remove from canvas
    if (fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        canvas.remove(activeObject);
        canvas.renderAll();
      }
    }

    setSelectedZone(null);
  };

  if (!activePage) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-gray-500">Select a page to start editing</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Zone Selection Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Edit3 className="h-4 w-4" />
            Customization Zones
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedZone ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="secondary" className="mb-2">
                    Zone Selected
                  </Badge>
                  <div className="text-sm text-gray-600">
                    ID: {selectedZone.zoneId.slice(0, 8)}...
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveCustomization}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <Separator />

              {/* Content Type Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Content Type</Label>
                <div className="flex gap-2">
                  <Button
                    variant={editingType === "text" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEditingType("text")}
                    className="flex items-center gap-2"
                  >
                    <Type className="h-4 w-4" />
                    Text
                  </Button>
                  <Button
                    variant={editingType === "image" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEditingType("image")}
                    className="flex items-center gap-2"
                  >
                    <Image className="h-4 w-4" />
                    Image
                  </Button>
                </div>
              </div>

              {/* Content Editor */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {editingType === "text" ? "Text Content" : "Image URL"}
                </Label>
                {editingType === "text" ? (
                  <Textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    placeholder="Enter your text here..."
                    className="min-h-[80px]"
                  />
                ) : (
                  <Input
                    type="url"
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                )}
              </div>

              <Button 
                onClick={handleContentUpdate}
                className="w-full"
                disabled={!editingContent.trim()}
              >
                Update Content
              </Button>
            </div>
          ) : (
            <div className="text-center py-6">
              <Edit3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <div className="text-sm text-gray-500 mb-1">No zone selected</div>
              <div className="text-xs text-gray-400">
                Click on a highlighted zone in the canvas to edit it
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Customizations Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Current Customizations</CardTitle>
        </CardHeader>
        <CardContent>
          {customizations.length > 0 ? (
            <div className="space-y-2">
              {customizations.map((custom, index) => (
                <div key={custom.zoneId || index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    {custom.type === "text" ? (
                      <Type className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Image className="h-4 w-4 text-green-600" />
                    )}
                    <span className="text-sm">
                      {custom.content ? 
                        (custom.content.length > 20 ? 
                          `${custom.content.substring(0, 20)}...` : 
                          custom.content
                        ) : 
                        'Empty'
                      }
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {custom.type}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-sm text-gray-500 py-4">
              No customizations yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerZoneEditor;
