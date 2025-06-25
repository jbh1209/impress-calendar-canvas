
import PageNavigator from "@/components/admin/template/PageNavigator";
import TemplateCanvas from "@/components/admin/template/TemplateCanvas";
import { getTemplatePages } from "@/services/templatePageService";
import { useRef, useEffect, useState } from "react";
import { Canvas } from "fabric";
import { Card, CardContent } from "@/components/ui/card";

const AdminTemplateEditorMain = ({
  mode,
  templateId,
  templateData,
  isLoading,
  setIsLoading,
}) => {
  const [pages, setPages] = useState([]);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const fabricCanvasRef = useRef<Canvas | null>(null);

  const activePage = pages[activePageIndex];

  useEffect(() => {
    if (mode === "edit" && templateId) {
      setIsLoading(true);
      getTemplatePages(templateId)
        .then((results) => {
          setPages(results || []);
          setActivePageIndex(0);
        })
        .finally(() => setIsLoading(false));
    }
  }, [templateId, mode, setIsLoading]);

  if (mode === "create") {
    return (
      <div className="h-96 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ready to Create Template
            </h3>
            <p className="text-sm text-gray-600">
              Fill out template details above and save to create your new template.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mode === "edit" && pages.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ready for PDF Upload
            </h3>
            <p className="text-sm text-gray-600">
              Upload a PDF file using the button above to start defining customizable zones.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* Page Navigation */}
      {pages.length > 0 && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <PageNavigator
            pages={pages}
            activePageIndex={activePageIndex}
            setActivePageIndex={setActivePageIndex}
            templateData={templateData}
          />
        </div>
      )}

      {/* Canvas and Zone Manager */}
      {pages.length > 0 && (
        <TemplateCanvas
          isEditing={true}
          templateId={templateId}
          templateData={templateData}
          activePage={activePage}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          fabricCanvasRef={fabricCanvasRef}
        />
      )}
    </div>
  );
};

export default AdminTemplateEditorMain;
