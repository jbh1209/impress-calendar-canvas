
import React, { useRef, useEffect, useState } from "react";
import { Canvas as FabricCanvas } from "fabric";
import { Template, TemplatePage } from "@/services/types/templateTypes";
import { loadTemplateBackground } from "@/components/admin/template/utils/zoneUtils";
import { getZoneAssignmentsByPageId } from "@/services/zonePageAssignmentService";
import { renderCustomerZones } from "./utils/customerCanvasUtils";

interface CustomerCanvasProps {
  template: Template | null;
  activePage?: TemplatePage;
  customerDesign: any;
  setCustomerDesign: (design: any) => void;
}

const CustomerCanvas: React.FC<CustomerCanvasProps> = ({
  template,
  activePage,
  customerDesign,
  setCustomerDesign
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initializeCanvas = async () => {
      if (!canvasRef.current || !activePage) return;

      try {
        setIsLoading(true);

        // Dispose of existing canvas
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.dispose();
        }

        // Calculate canvas dimensions
        let canvasWidth = 800;
        let canvasHeight = 600;

        if (activePage.pdf_page_width && activePage.pdf_page_height) {
          const aspectRatio = activePage.pdf_page_width / activePage.pdf_page_height;
          const maxWidth = 900;
          const maxHeight = 650;

          if (aspectRatio > 1) {
            canvasWidth = Math.min(maxWidth, activePage.pdf_page_width);
            canvasHeight = canvasWidth / aspectRatio;
          } else {
            canvasHeight = Math.min(maxHeight, activePage.pdf_page_height);
            canvasWidth = canvasHeight * aspectRatio;
          }
        }

        const canvas = new FabricCanvas(canvasRef.current, {
          width: canvasWidth,
          height: canvasHeight,
          backgroundColor: "#ffffff",
          selection: true,
          preserveObjectStacking: true,
        });

        fabricCanvasRef.current = canvas;

        // Load background image
        if (activePage.preview_image_url) {
          await loadTemplateBackground(canvas, activePage.preview_image_url, {
            width: canvasWidth,
            height: canvasHeight
          });
        } else if (template?.base_image_url) {
          await loadTemplateBackground(canvas, template.base_image_url, {
            width: canvasWidth,
            height: canvasHeight
          });
        }

        // Load zone assignments and render customer zones
        const zoneAssignments = await getZoneAssignmentsByPageId(activePage.id);
        
        renderCustomerZones(
          canvas, 
          zoneAssignments, 
          activePage,
          customerDesign[activePage.id] || { zones: {}, customizations: {} }
        );

        // Add event listeners for customer interactions
        canvas.on('object:modified', (e) => {
          const obj = e.target;
          if (obj) {
            const props = obj.get('customProps' as any);
            if (props?.isCustomerContent) {
              // Update customer design state
              const pageDesign = customerDesign[activePage.id] || { zones: {}, customizations: {} };
              pageDesign.customizations[props.zoneId] = {
                x: obj.left,
                y: obj.top,
                width: obj.width,
                height: obj.height,
                scaleX: obj.scaleX,
                scaleY: obj.scaleY,
                angle: obj.angle
              };
              
              setCustomerDesign({
                ...customerDesign,
                [activePage.id]: pageDesign
              });
            }
          }
        });

      } catch (error) {
        console.error("Error initializing customer canvas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeCanvas();

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [activePage, template]);

  return (
    <div className="relative">
      <div className="border-2 border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden">
        <canvas ref={canvasRef} className="max-w-full" />
      </div>
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <div className="text-sm text-gray-600">Loading Editor...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerCanvas;
