
/**
 * Professional coordinate system for print production
 * Handles conversion between different units and coordinate systems
 */

export type PrintUnit = 'pt' | 'mm' | 'in' | 'px';

export interface Dimensions {
  width: number;
  height: number;
  unit: PrintUnit;
}

export interface PrintMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
  unit: PrintUnit;
}

export interface Coordinates {
  x: number;
  y: number;
  width: number;
  height: number;
  unit: PrintUnit;
}

// Conversion factors to points (PDF standard unit)
const UNITS_TO_POINTS: Record<PrintUnit, number> = {
  pt: 1,
  mm: 2.834645669,
  in: 72,
  px: 0.75 // Assuming 96 DPI
};

export class CoordinateSystem {
  private canvasWidth: number;
  private canvasHeight: number;
  private pdfWidth: number;
  private pdfHeight: number;
  private targetDimensions: Dimensions;

  constructor(
    canvasWidth: number,
    canvasHeight: number,
    pdfWidth: number,
    pdfHeight: number,
    targetDimensions: Dimensions
  ) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.pdfWidth = pdfWidth;
    this.pdfHeight = pdfHeight;
    this.targetDimensions = targetDimensions;
  }

  // Convert between different units
  static convertUnit(value: number, fromUnit: PrintUnit, toUnit: PrintUnit): number {
    if (fromUnit === toUnit) return value;
    
    // Convert to points first, then to target unit
    const points = value * UNITS_TO_POINTS[fromUnit];
    return points / UNITS_TO_POINTS[toUnit];
  }

  // Convert canvas coordinates to PDF coordinates
  canvasToPdf(canvasX: number, canvasY: number): { x: number; y: number } {
    const scaleX = this.pdfWidth / this.canvasWidth;
    const scaleY = this.pdfHeight / this.canvasHeight;
    
    return {
      x: canvasX * scaleX,
      y: canvasY * scaleY
    };
  }

  // Convert PDF coordinates to canvas coordinates
  pdfToCanvas(pdfX: number, pdfY: number): { x: number; y: number } {
    const scaleX = this.canvasWidth / this.pdfWidth;
    const scaleY = this.canvasHeight / this.pdfHeight;
    
    return {
      x: pdfX * scaleX,
      y: pdfY * scaleY
    };
  }

  // Convert canvas coordinates to physical print coordinates
  canvasToPhysical(canvasX: number, canvasY: number, unit: PrintUnit = 'mm'): { x: number; y: number } {
    const pdf = this.canvasToPdf(canvasX, canvasY);
    
    return {
      x: CoordinateSystem.convertUnit(pdf.x, 'pt', unit),
      y: CoordinateSystem.convertUnit(pdf.y, 'pt', unit)
    };
  }

  // Convert physical coordinates to canvas coordinates
  physicalToCanvas(physicalX: number, physicalY: number, unit: PrintUnit = 'mm'): { x: number; y: number } {
    const pdfX = CoordinateSystem.convertUnit(physicalX, unit, 'pt');
    const pdfY = CoordinateSystem.convertUnit(physicalY, unit, 'pt');
    
    return this.pdfToCanvas(pdfX, pdfY);
  }

  // Get the scale factor between intended and actual PDF dimensions
  getScaleFactor(): { x: number; y: number } {
    const targetWidthPt = CoordinateSystem.convertUnit(
      this.targetDimensions.width, 
      this.targetDimensions.unit, 
      'pt'
    );
    const targetHeightPt = CoordinateSystem.convertUnit(
      this.targetDimensions.height, 
      this.targetDimensions.unit, 
      'pt'
    );
    
    return {
      x: targetWidthPt / this.pdfWidth,
      y: targetHeightPt / this.pdfHeight
    };
  }

  // Check if PDF dimensions match target dimensions (within tolerance)
  dimensionsMatch(tolerance: number = 0.1): boolean {
    const scale = this.getScaleFactor();
    return Math.abs(scale.x - 1) < tolerance && Math.abs(scale.y - 1) < tolerance;
  }
}
