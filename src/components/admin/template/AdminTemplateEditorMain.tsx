
import { Card, CardContent } from "@/components/ui/card";
import PageNavigator from "@/components/admin/template/PageNavigator";
import TemplateCanvas from "@/components/admin/template/TemplateCanvas";
import PdfUploadSection from "@/components/admin/template/PdfUploadSection";
import PdfMetadataDisplay from "@/components/admin/template/PdfMetadataDisplay";
import { getTemplatePages } from "@/services/templatePageService";
import { useRef, useEffect, useState } from "react";
import { Canvas } from "fabric";

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

  // Get the currently active page
  const activePage = pages[activePageIndex];

  useEffect(() => {
    if (mode === "edit" && templateId) {
      setIsLoading(true);
      getTemplatePages(templateId)
        .then((results) => {
          console.log("[AdminTemplateEditorMain] Loaded pages:", results);
          setPages(results || []);
          // Reset to first page when pages change
          setActivePageIndex(0);
        })
        .finally(() => setIsLoading(false));
    }
  }, [templateId, mode, setIsLoading]);

  const handleProcessingComplete = async () => {
    console.log("[AdminTemplateEditorMain] PDF processing complete, reloading pages...");
    setIsLoading(true);
    try {
      const results = await getTemplatePages(templateId);
      console.log("[AdminTemplateEditorMain] Reloaded pages after processing:", results);
      setPages(results || []);
      setActivePageIndex(0); // Reset to first page
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Show PDF metadata if we have a processed PDF */}
      {mode === "edit" && templateData && (
        <PdfMetadataDisplay 
          templateData={templateData} 
          isVisible={true}
        />
      )}

      {/* PDF Upload Section for edit mode */}
      {mode === "edit" && templateId && (
        <PdfUploadSection
          templateId={templateId}
          onProcessingComplete={handleProcessingComplete}
        />
      )}

      {/* Main Editor Content */}
      {mode === "edit" && pages.length > 0 ? (
        <div className="space-y-4">
          {/* Page Navigation */}
          <PageNavigator
            pages={pages}
            activePageIndex={activePageIndex}
            setActivePageIndex={setActivePageIndex}
            templateData={templateData}
          />
          
          {/* Canvas Editor */}
          <Card>
            <CardContent className="p-4">
              <TemplateCanvas
                isEditing={true}
                templateId={templateId}
                templateData={templateData}
                activePage={activePage}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                fabricCanvasRef={fabricCanvasRef}
              />
            </CardContent>
          </Card>
        </div>
      ) : mode === "create" ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="text-4xl mb-4">⚙️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Ready to Create Template
              </h3>
              <p className="text-gray-600 mb-4">
                Fill out the template details in the sidebar and save to create your new template. 
                Once saved, you'll be able to upload a PDF and start defining customization zones.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Ready for PDF Upload
              </h3>
              <p className="text-gray-600 mb-4">
                Upload a vector PDF above to start defining customization zones with preserved print quality.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminTemplateEditorMain;
