
import { useParams, useLocation } from "react-router-dom";
import { useTemplateEditor } from "@/hooks/admin/template/useTemplateEditor";
import TemplateToolbar from "@/components/admin/template/TemplateToolbar";
import AdminTemplateEditorMain from "@/components/admin/template/AdminTemplateEditorMain";

export default function TemplateEditor() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  
  const isCreateMode = location.pathname.includes('/create');
  const templateId = isCreateMode ? null : id || null;
  
  const templateEditorState = useTemplateEditor(templateId);

  const handleProcessingComplete = () => {
    // This will be handled by AdminTemplateEditorMain
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Horizontal Toolbar */}
      <TemplateToolbar
        template={templateEditorState.template}
        setTemplate={templateEditorState.setTemplate}
        isLoading={templateEditorState.isLoading}
        templateId={templateEditorState.templateId}
        setTemplateId={templateEditorState.setTemplateId}
        onProcessingComplete={handleProcessingComplete}
      />
      
      {/* Main Content Area */}
      <div className="flex-1">
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
