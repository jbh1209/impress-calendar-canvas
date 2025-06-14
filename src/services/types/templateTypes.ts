// Shared type definitions for templates and customization zones

export interface CustomizationZone {
  id?: string; // Made optional to support creating new zones
  template_id?: string;
  name: string;
  type: 'image' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  z_index?: number;
}

export interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string;
  is_active: boolean;
  base_image_url: string | null;
  dimensions: string | null;
  created_at: string;
  created_by?: string | null;
  customization_zones?: CustomizationZone[];
  products?: Array<{
    product_id: string;
    is_default: boolean;
    products: {
      name: string;
    }
  }>;
}

// Database row interfaces to help with type casting
export interface TemplateRow {
  id: string;
  name: string;
  description: string | null;
  category: string;
  is_active: boolean;
  base_image_url: string | null;
  dimensions: string | null;
  created_at: string;
  created_by: string | null;
  updated_at: string;
}

export interface ZoneRow {
  id: string;
  template_id: string;
  name: string;
  type: 'image' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  z_index: number;
  created_at: string;
  updated_at: string;
}

// Add TemplatePage type
export interface TemplatePage {
  id: string;
  template_id: string;
  page_number: number;
  preview_image_url: string | null;
  created_at: string;
  updated_at: string;
}

// Add ZonePageAssignment type
export interface ZonePageAssignment {
  id: string;
  zone_id: string;
  page_id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  z_index: number;
  is_repeating: boolean;
}
