
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
    <div className="h-full flex flex-col bg-gray-50">
      {/* Ultra-compact Top Section */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200">
        {/* PDF Metadata - Ultra-compact */}
        {mode === "edit" && templateData && (
          <div className="px-2 py-1.5">
            <PdfMetadataDisplay 
              templateData={templateData} 
              isVisible={true}
            />
          </div>
        )}

        {/* PDF Upload - Ultra-compact */}
        {mode === "edit" && templateId && (
          <div className="px-2 pb-1.5">
            <PdfUploadSection
              templateId={templateId}
              onProcessingComplete={handleProcessingComplete}
            />
          </div>
        )}

        {/* Page Navigation - Ultra-compact */}
        {mode === "edit" && pages.length > 0 && (
          <div className="px-2 py-1.5 border-t border-gray-100">
            <PageNavigator
              pages={pages}
              activePageIndex={activePageIndex}
              setActivePageIndex={setActivePageIndex}
              templateData={templateData}
            />
          </div>
        )}
      </div>

      {/* Main Content Area - Fully Maximized */}
      <div className="flex-1 overflow-hidden min-h-0">
        {mode === "edit" && pages.length > 0 ? (
          <div className="h-full">
            <TemplateCanvas
              isEditing={true}
              templateId={templateId}
              templateData={templateData}
              activePage={activePage}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              fabricCanvasRef={fabricCanvasRef}
            />
          </div>
        ) : mode === "create" ? (
          <div className="h-full flex items-center justify-center">
            <div className="max-w-md mx-auto text-center p-4">
              <div className="text-2xl mb-2">⚙️</div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                Ready to Create Template
              </h3>
              <p className="text-xs text-gray-600">
                Fill out template details and save to create.
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="max-w-md mx-auto text-center p-4">
              <div className="text-2xl mb-2">📄</div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                Ready for PDF Upload
              </h3>
              <p className="text-xs text-gray-600">
                Upload PDF above to start defining zones.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTemplateEditorMain;
