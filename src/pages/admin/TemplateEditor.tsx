
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

  function validateTemplate(template) {
    if (!template.name?.trim()) return "Template name is required.";
    if (!template.dimensions?.trim()) return "Dimensions are required.";
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

  // Minimalist, modern background (light color with fade) 
  return (
    <div className="bg-gradient-to-br from-zinc-100 to-zinc-200 min-h-screen w-full px-2 py-8">
      <AdminTemplateEditorLayout>
        <AdminTemplateEditorHeader
          {...templateEditorState}
          handleSaveTemplate={handleSaveTemplate}
          isLoading={isSaving || templateEditorState.isLoading}
        />
        {/* Use a single centered settings panel on create/new */}
        <div className="flex justify-center items-start w-full mt-2">
          <AdminTemplateEditorSettingsPanel {...templateEditorState} />
        </div>
      </AdminTemplateEditorLayout>
    </div>
  );
};

export default TemplateEditor;
