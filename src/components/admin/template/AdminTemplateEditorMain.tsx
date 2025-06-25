
import PdfUploadSection from "@/components/admin/template/PdfUploadSection";
import PdfMetadataDisplay from "@/components/admin/template/PdfMetadataDisplay";
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

  const handleProcessingComplete = async () => {
    setIsLoading(true);
    try {
      const results = await getTemplatePages(templateId);
      setPages(results || []);
      setActivePageIndex(0);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header Area */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200">
        <div className="p-6 space-y-4">
          {/* PDF Metadata */}
          {mode === "edit" && templateData && (
            <PdfMetadataDisplay 
              templateData={templateData} 
              isVisible={true}
            />
          )}

          {/* PDF Upload */}
          {mode === "edit" && templateId && (
            <PdfUploadSection
              templateId={templateId}
              onProcessingComplete={handleProcessingComplete}
            />
          )}

          {/* Page Navigation */}
          {mode === "edit" && pages.length > 0 && (
            <PageNavigator
              pages={pages}
              activePageIndex={activePageIndex}
              setActivePageIndex={setActivePageIndex}
              templateData={templateData}
            />
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0">
        {mode === "edit" && pages.length > 0 ? (
          <TemplateCanvas
            isEditing={true}
            templateId={templateId}
            templateData={templateData}
            activePage={activePage}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            fabricCanvasRef={fabricCanvasRef}
          />
        ) : mode === "create" ? (
          <div className="h-full flex items-center justify-center">
            <Card className="max-w-md mx-auto">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">⚙️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ready to Create Template
                </h3>
                <p className="text-sm text-gray-600">
                  Fill out template details in the sidebar and save to create your new template.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <Card className="max-w-md mx-auto">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">📄</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ready for PDF Upload
                </h3>
                <p className="text-sm text-gray-600">
                  Upload a PDF file above to start defining customizable zones.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTemplateEditorMain;
