
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TemplateEditorHeaderProps {
  isCreateMode: boolean;
  templateName: string;
  onSave: () => void;
  isLoading: boolean;
}

const TemplateEditorHeader: React.FC<TemplateEditorHeaderProps> = ({
  isCreateMode,
  templateName,
  onSave,
  isLoading
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/admin/templates')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {isCreateMode ? 'Create Template' : 'Edit Template'}
          </h1>
        </div>
        
        <Button onClick={onSave} disabled={!templateName.trim() || isLoading}>
          <Save className="h-4 w-4 mr-2" />
          Save Template
        </Button>
      </div>
    </div>
  );
};

export default TemplateEditorHeader;
