
import TemplateSettings from "@/components/admin/template/TemplateSettings";

const AdminTemplateEditorSettingsPanel = ({
  template,
  setTemplate,
}) => (
  <TemplateSettings template={template} setTemplate={setTemplate} />
);

export default AdminTemplateEditorSettingsPanel;
