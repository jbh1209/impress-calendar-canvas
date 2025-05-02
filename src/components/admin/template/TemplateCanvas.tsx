
import { useRef } from "react";
import { Canvas as FabricCanvas } from "fabric";
import Canvas from "./Canvas";
import ZoneControls from "./ZoneControls";

interface TemplateCanvasProps {
  isEditing: boolean;
  templateId?: string;
  templateData?: any;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const TemplateCanvas = (props: TemplateCanvasProps) => {
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  
  return (
    <div className="border rounded-lg overflow-hidden">
      {props.isLoading ? (
        <div className="w-full h-[600px] bg-gray-100 animate-pulse flex items-center justify-center">
          Loading editor...
        </div>
      ) : (
        <div className="relative">
          <Canvas {...props} fabricCanvasRef={fabricCanvasRef} />
          <ZoneControls fabricCanvasRef={fabricCanvasRef} />
        </div>
      )}
    </div>
  );
};

export default TemplateCanvas;
