
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Save, Download, Eye, RotateCcw, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CustomerToolbarProps {
  templateName: string;
  totalCustomizations: number;
  onPreview: () => void;
  onSave: () => void;
  onReset: () => void;
  hasUnsavedChanges: boolean;
}

const CustomerToolbar: React.FC<CustomerToolbarProps> = ({
  templateName,
  totalCustomizations,
  onPreview,
  onSave,
  onReset,
  hasUnsavedChanges
}) => {
  const navigate = useNavigate();

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="font-semibold text-lg">{templateName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {totalCustomizations} customizations
                </Badge>
                {hasUnsavedChanges && (
                  <Badge variant="outline" className="text-xs text-orange-600">
                    Unsaved changes
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
            
            <Separator orientation="vertical" className="h-6" />
            
            <Button
              variant="outline"
              size="sm"
              onClick={onPreview}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            
            <Button
              onClick={onSave}
              size="sm"
              className="flex items-center gap-2"
              disabled={!hasUnsavedChanges}
            >
              <Save className="h-4 w-4" />
              {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerToolbar;
