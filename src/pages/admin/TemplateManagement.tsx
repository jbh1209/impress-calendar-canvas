import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import TemplateList from "@/components/admin/templates/TemplateList";
import TemplatePdfUpload from "@/components/admin/templates/TemplatePdfUpload";

const TemplateManagement = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTemplate = async () => {
    if (!formData.name.trim() || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('templates')
        .insert({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          category: formData.category,
          is_active: false
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Template created successfully");
      setFormData({ name: '', description: '', category: '' });
      setShowCreateForm(false);
      
      // Refresh template list by triggering a refetch
      window.location.reload();
      
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error("Failed to create template");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Template Management</h1>
          <p className="text-muted-foreground">Create and manage calendar templates</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} disabled={showCreateForm}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., 2024 Corporate Calendar"
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Corporate">Corporate</SelectItem>
                    <SelectItem value="Personal">Personal</SelectItem>
                    <SelectItem value="Nature">Nature</SelectItem>
                    <SelectItem value="Seasonal">Seasonal</SelectItem>
                    <SelectItem value="Holiday">Holiday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe this template..."
                rows={3}
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleCreateTemplate} disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Template'}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <TemplateList />
    </div>
  );
};

export default TemplateManagement;