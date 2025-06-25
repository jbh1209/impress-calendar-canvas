
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
    <div className="h-full flex bg-white">
      {/* Main Canvas Area - Fully Maximized */}
      <div className="flex-1 overflow-hidden min-w-0">
        {props.isLoading ? (
          <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600 mb-1">Loading Editor...</div>
              <div className="text-xs text-gray-500">Preparing canvas</div>
            </div>
          </div>
        ) : (
          <Canvas {...props} />
        )}
      </div>
      
      {/* Ultra-compact Zone Management Panel */}
      <div className="w-56 border-l border-gray-200 bg-gray-50 overflow-y-auto flex-shrink-0">
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
