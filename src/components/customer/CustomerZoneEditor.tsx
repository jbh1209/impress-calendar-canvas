
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Image, Type, Upload, Palette, Settings } from "lucide-react";
import { TemplatePage } from "@/services/types/templateTypes";
import { getZoneAssignmentsByPageId } from "@/services/zonePageAssignmentService";
import { toast } from "sonner";

interface CustomerZoneEditorProps {
  activePage?: TemplatePage;
  customerDesign: any;
  setCustomerDesign: (design: any) => void;
}

const CustomerZoneEditor: React.FC<CustomerZoneEditorProps> = ({
  activePage,
  customerDesign,
  setCustomerDesign
}) => {
  const [zoneAssignments, setZoneAssignments] = useState<any[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [textContent, setTextContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const loadZones = async () => {
      if (!activePage) return;
      
      try {
        const assignments = await getZoneAssignmentsByPageId(activePage.id);
        setZoneAssignments(assignments);
      } catch (error) {
        console.error("Error loading zones:", error);
      }
    };

    loadZones();
  }, [activePage]);

  const pageDesign = activePage ? (customerDesign[activePage.id] || { zones: {}, customizations: {} }) : { zones: {}, customizations: {} };

  const handleTextUpdate = (zoneId: string, content: string) => {
    if (!activePage) return;

    const updatedPageDesign = {
      ...pageDesign,
      zones: {
        ...pageDesign.zones,
        [zoneId]: {
          ...pageDesign.zones[zoneId],
          content: content,
          type: 'text'
        }
      }
    };

    setCustomerDesign({
      ...customerDesign,
      [activePage.id]: updatedPageDesign
    });

    toast.success("Text updated");
  };

  const handleImageUpload = (zoneId: string, file: File) => {
    if (!activePage) return;

    // Create object URL for preview
    const imageUrl = URL.createObjectURL(file);

    const updatedPageDesign = {
      ...pageDesign,
      zones: {
        ...pageDesign.zones,
        [zoneId]: {
          ...pageDesign.zones[zoneId],
          imageUrl: imageUrl,
          imageFile: file,
          type: 'image'
        }
      }
    };

    setCustomerDesign({
      ...customerDesign,
      [activePage.id]: updatedPageDesign
    });

    toast.success("Image uploaded");
  };

  const getZoneType = (assignment: any) => {
    // Default mapping - in a real app this would come from zone definitions
    return assignment.is_repeating ? 'text' : 'image';
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Customize Your Calendar
        </CardTitle>
        {activePage && (
          <div>
            <Badge variant="outline" className="text-xs">
              Page {activePage.page_number}
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {zoneAssignments.length > 0 ? (
          <Tabs defaultValue="zones" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="zones">Content</TabsTrigger>
              <TabsTrigger value="style">Style</TabsTrigger>
            </TabsList>
            
            <TabsContent value="zones" className="space-y-4">
              <div className="space-y-3">
                <Label className="text-xs font-medium">Customizable Areas</Label>
                
                {zoneAssignments.map((assignment, index) => {
                  const zoneType = getZoneType(assignment);
                  const zoneContent = pageDesign.zones[assignment.id];
                  
                  return (
                    <Card key={assignment.id} className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {zoneType === 'image' ? (
                            <Image className="h-3 w-3" />
                          ) : (
                            <Type className="h-3 w-3" />
                          )}
                          <span className="text-xs font-medium">
                            Zone {index + 1}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {zoneType}
                        </Badge>
                      </div>
                      
                      {zoneType === 'text' ? (
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Enter your text..."
                            value={zoneContent?.content || ''}
                            onChange={(e) => setTextContent(e.target.value)}
                            className="text-xs min-h-[60px]"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleTextUpdate(assignment.id, textContent)}
                            className="w-full h-7 text-xs"
                          >
                            Update Text
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setImageFile(file);
                                handleImageUpload(assignment.id, file);
                              }
                            }}
                            className="text-xs h-8"
                          />
                          {zoneContent?.imageUrl && (
                            <div className="text-xs text-green-600">
                              ✓ Image uploaded
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
            
            <TabsContent value="style" className="space-y-4">
              <div className="text-center text-gray-500 text-xs py-8">
                <Palette className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                Style customization coming soon!
                <div className="text-xs mt-1">
                  Font selection, colors, and effects
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center text-gray-500 text-xs py-8">
            <div className="text-sm mb-2">No customizable areas</div>
            <div>This page doesn't have any zones to customize</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerZoneEditor;
