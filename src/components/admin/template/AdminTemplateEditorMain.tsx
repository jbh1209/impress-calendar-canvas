
import { Card, CardContent } from "@/components/ui/card";
import TemplatePageNavigator from "@/components/admin/template/TemplatePageNavigator";
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

  useEffect(() => {
    if (mode === "edit" && templateId) {
      setIsLoading(true);
      getTemplatePages(templateId)
        .then((results) => setPages(results || []))
        .finally(() => setIsLoading(false));
    }
  }, [templateId, mode, setIsLoading]);

  return (
    <>
      {/* Show PDF metadata if we have a processed PDF */}
      <PdfMetadataDisplay 
        templateData={templateData} 
        isVisible={mode === "edit" && !!templateData}
      />

      {mode === "edit" && templateId && (
        <PdfUploadSection
          templateId={templateId}
          onProcessingComplete={async () => {
            setIsLoading(true);
            const results = await getTemplatePages(templateId);
            setPages(results || []);
            setIsLoading(false);
          }}
        />
      )}

      {mode === "edit" && pages.length > 0 ? (
        <Card className="mb-6">
          <CardContent className="p-6">
            <TemplatePageNavigator
              pages={pages}
              activePageIndex={activePageIndex}
              setActivePageIndex={setActivePageIndex}
            />
            <TemplateCanvas
              isEditing={true}
              templateId={templateId}
              templateData={templateData}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              fabricCanvasRef={fabricCanvasRef}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardContent className="p-16 text-center">
            <div className="text-lg text-gray-700 mb-2 font-medium">
              {mode === "edit"
                ? "Ready for PDF Upload"
                : "Set template details and save to start"}
            </div>
            <div className="text-gray-500 mb-4">
              {mode === "edit"
                ? "Upload a vector PDF to start defining customization zones."
                : "Enter required info, then save to create your new template."}
            </div>
            <span role="img" aria-label="PDF" className="text-4xl">
              📄
            </span>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default AdminTemplateEditorMain;
