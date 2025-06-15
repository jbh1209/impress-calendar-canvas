
import { useParams } from "react-router-dom";
import { useTemplateEditor } from "@/hooks/admin/template/useTemplateEditor";
import AdminTemplateEditorLayout from "@/components/admin/template/AdminTemplateEditorLayout";
import AdminTemplateEditorHeader from "@/components/admin/template/AdminTemplateEditorHeader";
import AdminTemplateEditorMain from "@/components/admin/template/AdminTemplateEditorMain";
import AdminTemplateEditorSettingsPanel from "@/components/admin/template/AdminTemplateEditorSettingsPanel";
import { toast } from "sonner";
import { saveTemplate } from "@/services/templateService";
import { useState } from "react";

const TemplateEditor = () => {
  const { id } = useParams<{ id: string }>();
  const templateEditorState = useTemplateEditor(id || null);
  const [isSaving, setIsSaving] = useState(false);

  // Validation: ensure required fields
  function validateTemplate(template) {
    if (!template.name?.trim()) return "Template name is required.";
    if (!template.dimensions?.trim()) return "Dimensions are required.";
    // Add more as needed (category...)
    return null;
  }

  async function handleSaveTemplate() {
    const validationErr = validateTemplate(templateEditorState.template);
    if (validationErr) {
      toast.error(validationErr);
      return;
    }
    setIsSaving(true);
    try {
      const result = await saveTemplate({ ...templateEditorState.template, id: templateEditorState.templateId });
      if (result) {
        toast.success("Template saved!");
        if (!templateEditorState.templateId) {
          templateEditorState.setTemplateId(result.id);
        }
      } else {
        toast.error("Failed to save template.");
      }
    } catch (e) {
      toast.error("Error saving template.");
    }
    setIsSaving(false);
  }

  return (
    <AdminTemplateEditorLayout>
      <AdminTemplateEditorHeader
        {...templateEditorState}
        handleSaveTemplate={handleSaveTemplate}
        isLoading={isSaving || templateEditorState.isLoading}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AdminTemplateEditorMain {...templateEditorState} />
        </div>
        <div>
          <AdminTemplateEditorSettingsPanel {...templateEditorState} />
        </div>
      </div>
    </AdminTemplateEditorLayout>
  );
};

export default TemplateEditor;
