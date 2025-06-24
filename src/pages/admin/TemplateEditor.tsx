
import { useParams, useLocation } from "react-router-dom";
import { useTemplateEditor } from "@/hooks/admin/template/useTemplateEditor";
import TemplateSettings from "@/components/admin/template/TemplateSettings";

export default function TemplateEditor() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  
  // Determine if we're in create mode based on the route
  const isCreateMode = location.pathname.includes('/create');
  const templateId = isCreateMode ? null : id || null;
  
  const templateEditorState = useTemplateEditor(templateId);

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
