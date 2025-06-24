
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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Main Canvas Area */}
      <div className="lg:col-span-3">
        {props.isLoading ? (
          <div className="w-full h-[600px] bg-gray-100 animate-pulse flex items-center justify-center rounded-lg">
            <div className="text-center">
              <div className="text-lg font-medium text-gray-600 mb-2">Loading Vector Editor...</div>
              <div className="text-sm text-gray-500">Preparing canvas for high-quality template editing</div>
            </div>
          </div>
        ) : (
          <Canvas {...props} />
        )}
      </div>
      
      {/* Advanced Zone Management Panel */}
      <div className="lg:col-span-1 space-y-4">
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
