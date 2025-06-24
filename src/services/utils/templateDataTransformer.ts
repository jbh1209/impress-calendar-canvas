
// Clean utility to transform UI template state to database format
export interface UITemplateState {
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  dimensions: string;
  units?: string;
  bleed?: any;
}

export interface DatabaseTemplateData {
  name: string;
  description: string | null;
  category: string;
  is_active: boolean;
  dimensions: string | null;
  base_image_url?: string | null;
}

export function transformUIToDatabase(uiTemplate: UITemplateState, templateId?: string): DatabaseTemplateData {
  return {
    name: uiTemplate.name?.trim() || "Untitled Template",
    description: uiTemplate.description?.trim() || null,
    category: uiTemplate.category || "Corporate",
    is_active: Boolean(uiTemplate.isActive),
    dimensions: uiTemplate.dimensions || null,
    base_image_url: null, // Will be set separately when image is uploaded
  };
}

export function transformDatabaseToUI(dbTemplate: any): UITemplateState {
  return {
    name: dbTemplate.name || "",
    description: dbTemplate.description || "",
    category: dbTemplate.category || "Corporate",
    isActive: Boolean(dbTemplate.is_active),
    dimensions: dbTemplate.dimensions || "11x8.5",
  };
}
