
import { useParams, useLocation } from "react-router-dom";
import { useTemplateEditor } from "@/hooks/admin/template/useTemplateEditor";
import TemplateSettings from "@/components/admin/template/TemplateSettings";
import AdminTemplateEditorMain from "@/components/admin/template/AdminTemplateEditorMain";

export default function TemplateEditor() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  
  const isCreateMode = location.pathname.includes('/create');
  const templateId = isCreateMode ? null : id || null;
  
  const templateEditorState = useTemplateEditor(templateId);

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      {/* Optimized Settings Sidebar - 240px */}
      <div className="w-60 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
        <TemplateSettings
          template={templateEditorState.template}
          setTemplate={templateEditorState.setTemplate}
          isLoading={templateEditorState.isLoading}
          templateId={templateEditorState.templateId}
          setTemplateId={templateEditorState.setTemplateId}
        />
      </div>
      
      {/* Main Editor Area - Fully Maximized */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <AdminTemplateEditorMain
          mode={templateEditorState.mode}
          templateId={templateEditorState.templateId}
          templateData={templateEditorState.templateData}
          isLoading={templateEditorState.isLoading}
          setIsLoading={templateEditorState.setIsLoading}
        />
      </div>
    </div>
  );
}
