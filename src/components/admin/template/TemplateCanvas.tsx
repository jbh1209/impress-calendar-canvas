
import { Canvas as FabricCanvas } from "fabric";
import Canvas from "./Canvas";
import AdvancedZoneManager from "./AdvancedZoneManager";
import { Template, TemplatePage } from "@/services/types/templateTypes";

interface TemplateCanvasProps {
  isEditing: boolean;
  templateId?: string;
  templateData?: Template | null;
  activePage?: TemplatePage;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  fabricCanvasRef: React.MutableRefObject<FabricCanvas | null>;
}

const TemplateCanvas = (props: TemplateCanvasProps) => {
  return (
    <div className="flex bg-white min-h-screen">
      {/* Main Canvas Area - 70% width */}
      <div className="flex-1 p-6">
        {props.isLoading ? (
          <div className="w-full h-96 bg-gray-100 animate-pulse flex items-center justify-center rounded-lg">
            <div className="text-center">
              <div className="text-base font-medium text-gray-600 mb-2">Loading Editor...</div>
              <div className="text-sm text-gray-500">Preparing canvas for editing</div>
            </div>
          </div>
        ) : (
          <Canvas {...props} />
        )}
      </div>
      
      {/* Zone Management Panel - 30% width */}
      <div className="w-80 border-l border-gray-200 bg-gray-50">
        <AdvancedZoneManager 
          fabricCanvasRef={props.fabricCanvasRef} 
          activePage={props.activePage}
          templateId={props.templateId}
        />
      </div>
    </div>
  );
};

export default TemplateCanvas;
