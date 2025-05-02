
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TemplateSettingsProps {
  template: {
    name: string;
    description: string;
    category: string;
    isActive: boolean;
    dimensions: string;
  };
  setTemplate: React.Dispatch<React.SetStateAction<{
    name: string;
    description: string;
    category: string;
    isActive: boolean;
    dimensions: string;
  }>>;
}

const TemplateSettings = ({ template, setTemplate }: TemplateSettingsProps) => {
  const [activeTab, setActiveTab] = useState("general");

  return (
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
  );
};

export default TemplateSettings;
