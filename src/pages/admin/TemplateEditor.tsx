
import { useParams } from "react-router-dom";
import { useTemplateEditor } from "@/hooks/admin/template/useTemplateEditor";
import TemplateSettings from "@/components/admin/template/TemplateSettings";

export default function TemplateEditor() {
  const { id } = useParams<{ id: string }>();
  const templateEditorState = useTemplateEditor(id || null);

  // Full-screen, light or gradient background
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 py-0 px-0 flex flex-col">
      {/* Modern TemplateSettings: handles its own header and save */}
      <TemplateSettings
        template={templateEditorState.template}
        setTemplate={templateEditorState.setTemplate}
        isLoading={templateEditorState.isLoading}
        templateId={templateEditorState.templateId}
        setTemplateId={templateEditorState.setTemplateId}
      />
    </div>
  );
}
