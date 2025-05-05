
import { Template } from "./templateTypes";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  dimensions: string | null;
  category: string | null;
  tags: string[] | null;
  thumbnail_url: string | null;
  is_active: boolean;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  variants?: ProductVariant[];
  templates?: {
    template_id: string;
    is_default: boolean;
    template?: Template;
  }[];
  images?: ProductImage[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  price_adjustment: number;
  stock_quantity: number;
  sku: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductTemplateAssociation {
  id: string;
  product_id: string;
  template_id: string;
  is_default: boolean;
  created_at: string;
}

// Database row interfaces for type casting
export interface ProductRow {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  dimensions: string | null;
  category: string | null;
  tags: string[] | null;
  thumbnail_url: string | null;
  is_active: boolean;
  created_at: string;
  created_by: string | null;
  updated_at: string;
}

export interface ProductVariantRow {
  id: string;
  product_id: string;
  name: string;
  price_adjustment: number;
  stock_quantity: number;
  sku: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductImageRow {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductTemplateRow {
  id: string;
  product_id: string;
  template_id: string;
  is_default: boolean;
  created_at: string;
}
