
import { useParams } from "react-router-dom";
import { useTemplateEditor } from "@/hooks/admin/template/useTemplateEditor";
import AdminTemplateEditorLayout from "@/components/admin/template/AdminTemplateEditorLayout";
import AdminTemplateEditorHeader from "@/components/admin/template/AdminTemplateEditorHeader";
import AdminTemplateEditorMain from "@/components/admin/template/AdminTemplateEditorMain";
import AdminTemplateEditorSettingsPanel from "@/components/admin/template/AdminTemplateEditorSettingsPanel";

const TemplateEditor = () => {
  const { id } = useParams<{ id: string }>();
  const templateEditorState = useTemplateEditor(id || null);

  return (
    <AdminTemplateEditorLayout>
      <AdminTemplateEditorHeader {...templateEditorState} />
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
