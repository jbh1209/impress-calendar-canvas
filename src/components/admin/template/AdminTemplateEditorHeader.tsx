
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";

interface Props {
  mode: string;
  isLoading: boolean;
  handleSaveTemplate?: () => void;
}

const AdminTemplateEditorHeader = ({
  mode,
  isLoading,
  handleSaveTemplate,
}: Props) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/admin/templates")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">
          {mode === "edit" ? "Edit Template" : "Create Template"}
        </h1>
      </div>
      <Button onClick={handleSaveTemplate} disabled={isLoading}>
        <Save className="mr-2 h-4 w-4" />
        Save Template
      </Button>
    </div>
  );
};

export default AdminTemplateEditorHeader;
