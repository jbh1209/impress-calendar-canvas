
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { PlusCircle, X, Check } from "lucide-react";
import { Template } from "@/services/templateService";
import { getAllTemplates } from "@/services/templateService";
import { toast } from "sonner";

interface ProductTemplateManagerProps {
  productId?: string;
  templates: Array<{
    template_id: string;
    is_default: boolean;
    template?: Template;
  }>;
  onChange: (templates: Array<{
    template_id: string;
    is_default: boolean;
    template?: Template;
  }>) => void;
}

const ProductTemplateManager = ({ 
  productId, 
  templates, 
  onChange 
}: ProductTemplateManagerProps) => {
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState<Template[]>([]);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load available templates
  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);
      const allTemplates = await getAllTemplates();
      
      // Filter out templates already associated with this product
      const templateIds = templates.map(t => t.template_id);
      const filteredTemplates = allTemplates.filter(t => !templateIds.includes(t.id));
      
      setAvailableTemplates(filteredTemplates);
      setIsLoading(false);
    };

    if (isAddingTemplate) {
      fetchTemplates();
    }
  }, [isAddingTemplate, templates]);

  const handleAddTemplates = () => {
    if (selectedTemplateIds.length === 0) {
      toast.error("Please select at least one template");
      return;
    }

    // Find template objects for selected IDs
    const templatesToAdd = selectedTemplateIds.map(id => {
      const templateObj = availableTemplates.find(t => t.id === id);
      return {
        template_id: id,
        is_default: false,
        template: templateObj
      };
    });

    // If this is the first template, make it default
    if (templates.length === 0 && templatesToAdd.length > 0) {
      templatesToAdd[0].is_default = true;
    }

    onChange([...templates, ...templatesToAdd]);
    setIsAddingTemplate(false);
    setSelectedTemplateIds([]);
  };

  const handleRemoveTemplate = (templateId: string) => {
    const newTemplates = templates.filter(t => t.template_id !== templateId);
    
    // If we removed the default template and others remain, set the first one as default
    if (
      templates.find(t => t.template_id === templateId)?.is_default && 
      newTemplates.length > 0 && 
      !newTemplates.some(t => t.is_default)
    ) {
      newTemplates[0].is_default = true;
    }
    
    onChange(newTemplates);
  };

  const handleSetDefault = (templateId: string) => {
    const newTemplates = templates.map(t => ({
      ...t,
      is_default: t.template_id === templateId
    }));
    
    onChange(newTemplates);
  };

  const handleTemplateSelection = (templateId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedTemplateIds([...selectedTemplateIds, templateId]);
    } else {
      setSelectedTemplateIds(selectedTemplateIds.filter(id => id !== templateId));
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Template Options</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAddingTemplate(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Templates
          </Button>
        </CardHeader>
        <CardContent>
          {templates.length > 0 ? (
            <>
              <div className="text-sm text-muted-foreground mb-4">
                Select a default template that will be shown first to customers.
              </div>
              <RadioGroup value={templates.find(t => t.is_default)?.template_id}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Default</TableHead>
                      <TableHead>Template Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((item) => (
                      <TableRow key={item.template_id}>
                        <TableCell>
                          <RadioGroupItem 
                            value={item.template_id} 
                            id={`default-${item.template_id}`}
                            checked={item.is_default}
                            onClick={() => handleSetDefault(item.template_id)}
                          />
                        </TableCell>
                        <TableCell>{item.template?.name || "Loading..."}</TableCell>
                        <TableCell>{item.template?.category || "Unknown"}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRemoveTemplate(item.template_id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </RadioGroup>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No templates assigned to this product yet. Add templates to allow customers to customize.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog 
        open={isAddingTemplate} 
        onOpenChange={(open) => {
          setIsAddingTemplate(open);
          if (!open) setSelectedTemplateIds([]);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Templates</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {isLoading ? (
              <div className="text-center py-8">Loading available templates...</div>
            ) : availableTemplates.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Select</TableHead>
                    <TableHead>Template Name</TableHead>
                    <TableHead>Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedTemplateIds.includes(template.id)}
                          onCheckedChange={(checked) => 
                            handleTemplateSelection(template.id, checked === true)
                          }
                        />
                      </TableCell>
                      <TableCell>{template.name}</TableCell>
                      <TableCell>{template.category}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No available templates found. All templates are already assigned to this product or no templates exist.
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingTemplate(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddTemplates}
              disabled={selectedTemplateIds.length === 0}
            >
              Add Selected Templates
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductTemplateManager;
