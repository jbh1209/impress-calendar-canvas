
import { useParams, useLocation } from "react-router-dom";
import { useTemplateEditor } from "@/hooks/admin/template/useTemplateEditor";
import TemplateSettings from "@/components/admin/template/TemplateSettings";
import AdminTemplateEditorMain from "@/components/admin/template/AdminTemplateEditorMain";

export default function TemplateEditor() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  
  // Determine if we're in create mode based on the route
  const isCreateMode = location.pathname.includes('/create');
  const templateId = isCreateMode ? null : id || null;
  
  const templateEditorState = useTemplateEditor(templateId);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 p-6">
        {/* Settings Panel - Left Side */}
        <div className="xl:col-span-1">
          <TemplateSettings
            template={templateEditorState.template}
            setTemplate={templateEditorState.setTemplate}
            isLoading={templateEditorState.isLoading}
            templateId={templateEditorState.templateId}
            setTemplateId={templateEditorState.setTemplateId}
          />
        </div>
        
        {/* Main Editor Area - Right Side */}
        <div className="xl:col-span-2">
          <AdminTemplateEditorMain
            mode={templateEditorState.mode}
            templateId={templateEditorState.templateId}
            templateData={templateEditorState.templateData}
            isLoading={templateEditorState.isLoading}
            setIsLoading={templateEditorState.setIsLoading}
          />
        </div>
      </div>
    </div>
  );
}
