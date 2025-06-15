
// Use a clean, centered panel wrapper
import TemplateSettings from "@/components/admin/template/TemplateSettings";

const AdminTemplateEditorSettingsPanel = ({
  template,
  setTemplate,
}) => (
  <div className="flex justify-center items-start min-h-screen">
    <TemplateSettings
      template={template}
      setTemplate={setTemplate}
      isLoading={false}
      templateId={null}
      setTemplateId={() => {}}
    />
  </div>
);

export default AdminTemplateEditorSettingsPanel;

