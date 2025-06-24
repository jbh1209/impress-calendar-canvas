
import { Canvas as FabricCanvas } from "fabric";
import Canvas from "./Canvas";
import ZoneManager from "./ZoneManager";
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
              <div className="text-lg font-medium text-gray-600 mb-2">Loading Editor...</div>
              <div className="text-sm text-gray-500">Preparing canvas for page editing</div>
            </div>
          </div>
        ) : (
          <Canvas {...props} />
        )}
      </div>
      
      {/* Side Panel with Zone Management */}
      <div className="lg:col-span-1 space-y-4">
        <ZoneManager 
          fabricCanvasRef={props.fabricCanvasRef} 
          activePage={props.activePage}
        />
      </div>
    </div>
  );
};

export default TemplateCanvas;
