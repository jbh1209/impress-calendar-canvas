
/**
 * Unit conversion utilities for template editor
 */

// Points to millimeters conversion (1 point = 0.352778 mm)
export const pointsToMm = (points: number): number => {
  return Math.round(points * 0.352778 * 100) / 100; // Round to 2 decimal places
};

// Millimeters to points conversion
export const mmToPoints = (mm: number): number => {
  return Math.round(mm / 0.352778 * 100) / 100;
};

// Format dimension display with unit
export const formatDimension = (value: number, unit: string = 'pt'): string => {
  if (unit === 'pt') {
    const mmValue = pointsToMm(value);
    return `${mmValue} mm`;
  }
  return `${value} ${unit}`;
};

// Format dimensions string for display
export const formatDimensions = (width: number, height: number, unit: string = 'pt'): string => {
  if (unit === 'pt') {
    const widthMm = pointsToMm(width);
    const heightMm = pointsToMm(height);
    return `${widthMm} × ${heightMm} mm`;
  }
  return `${width} × ${height} ${unit}`;
};
