
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
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Settings Sidebar - Fixed width */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <TemplateSettings
              template={templateEditorState.template}
              setTemplate={templateEditorState.setTemplate}
              isLoading={templateEditorState.isLoading}
              templateId={templateEditorState.templateId}
              setTemplateId={templateEditorState.setTemplateId}
            />
          </div>
        </div>
        
        {/* Main Editor Area - Flexible width */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
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
    </div>
  );
}
