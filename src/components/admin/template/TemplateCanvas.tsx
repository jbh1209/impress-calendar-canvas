
import { Canvas as FabricCanvas } from "fabric";
import Canvas from "./Canvas";
import ZoneControls from "./ZoneControls";

interface TemplateCanvasProps {
  isEditing: boolean;
  templateId?: string;
  templateData?: any;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  fabricCanvasRef: React.MutableRefObject<FabricCanvas | null>;
}

const TemplateCanvas = (props: TemplateCanvasProps) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      {props.isLoading ? (
        <div className="w-full h-[600px] bg-gray-100 animate-pulse flex items-center justify-center">
          Loading editor...
        </div>
      ) : (
        <div className="relative">
          <Canvas {...props} />
          <ZoneControls fabricCanvasRef={props.fabricCanvasRef} />
        </div>
      )}
    </div>
  );
};

export default TemplateCanvas;
