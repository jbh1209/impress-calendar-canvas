
import React, { useEffect, useRef } from "react";
import { Canvas as FabricCanvas } from "fabric";
import { Template, TemplatePage } from "@/services/types/templateTypes";
import { setupCanvas, loadPageBackground, loadCustomizationZones } from "./utils/customerCanvasUtils";

export interface CustomerCanvasProps {
  template: Template;
  activePage?: TemplatePage;
  customizations: any[];
  onZoneUpdate: (zoneId: string, updates: any) => void;
  fabricCanvasRef: React.MutableRefObject<FabricCanvas | null>;
}

const CustomerCanvas: React.FC<CustomerCanvasProps> = ({
  template,
  activePage,
  customizations,
  onZoneUpdate,
  fabricCanvasRef
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !activePage) return;

    // Initialize Fabric.js canvas
    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff'
    });

    fabricCanvasRef.current = canvas;

    // Setup canvas with customer-specific configurations
    setupCanvas(canvas, onZoneUpdate);

    // Load page background and customization zones
    const loadPageContent = async () => {
      if (activePage.preview_image_url) {
        await loadPageBackground(canvas, activePage.preview_image_url);
      }
      
      // Load customization zones for this page
      await loadCustomizationZones(canvas, template.id, activePage.id, customizations);
    };

    loadPageContent();

    return () => {
      canvas.dispose();
    };
  }, [activePage, template.id, customizations, onZoneUpdate, fabricCanvasRef]);

  if (!activePage) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="text-gray-500 mb-2">No page selected</div>
          <div className="text-sm text-gray-400">Select a page to start customizing</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gray-100 rounded-lg p-4">
      <div className="flex justify-center">
        <canvas ref={canvasRef} className="border border-gray-300 rounded shadow-sm" />
      </div>
      
      <div className="mt-4 text-center">
        <div className="text-sm text-gray-600">
          Page {activePage.page_number} - {template.name}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Click on highlighted zones to customize content
        </div>
      </div>
    </div>
  );
};

export default CustomerCanvas;
