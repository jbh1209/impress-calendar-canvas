
// Define types for template and customization zones
export interface CustomizationZone {
  id: number;
  name: string;
  type: 'image' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Template {
  id: number;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  baseImageUrl: string;
  dimensions: string;
  createdAt: string;
  customizationZones: CustomizationZone[];
}

// Mock data for templates
const mockTemplates: Template[] = [
  { 
    id: 1, 
    name: "Professional Calendar", 
    description: "Clean, corporate design with customizable accent colors.",
    category: "Corporate",
    isActive: true,
    baseImageUrl: "https://placehold.co/600x400/darkblue/white?text=Professional+Calendar",
    dimensions: "11x8.5",
    createdAt: "2025-03-15T10:30:00Z",
    customizationZones: [
      { id: 1, name: "Header Logo", type: "image", x: 50, y: 50, width: 100, height: 50 },
      { id: 2, name: "Month Label", type: "text", x: 300, y: 50, width: 200, height: 50 },
      { id: 3, name: "Main Image", type: "image", x: 150, y: 150, width: 300, height: 200 }
    ]
  },
  { 
    id: 2, 
    name: "Family Calendar", 
    description: "Warm, friendly design with large photo areas for family pictures.",
    category: "Personal",
    isActive: true,
    baseImageUrl: "https://placehold.co/600x400/darkgreen/white?text=Family+Calendar",
    dimensions: "12x12",
    createdAt: "2025-03-20T14:15:00Z",
    customizationZones: [
      { id: 1, name: "Family Photo", type: "image", x: 50, y: 50, width: 300, height: 200 },
      { id: 2, name: "Month Title", type: "text", x: 400, y: 50, width: 200, height: 50 },
      { id: 3, name: "Events Area", type: "text", x: 100, y: 300, width: 400, height: 150 }
    ]
  },
  { 
    id: 3, 
    name: "Nature Seasons", 
    description: "Beautiful natural landscapes with seasonal themes for each month.",
    category: "Nature",
    isActive: false,
    baseImageUrl: "https://placehold.co/600x400/sienna/white?text=Nature+Calendar",
    dimensions: "11x8.5",
    createdAt: "2025-04-05T09:45:00Z",
    customizationZones: [
      { id: 1, name: "Seasonal Image", type: "image", x: 100, y: 50, width: 400, height: 250 },
      { id: 2, name: "Month Name", type: "text", x: 300, y: 320, width: 200, height: 50 },
      { id: 3, name: "Quote Area", type: "text", x: 150, y: 380, width: 300, height: 100 }
    ]
  }
];

// Template service functions for database interaction
export const getTemplateById = (id: number): Template | undefined => {
  return mockTemplates.find(template => template.id === id);
};

export const getAllTemplates = (): Template[] => {
  return [...mockTemplates];
};

export const saveTemplate = (template: Partial<Template>): Template => {
  // In a real implementation, this would save to a database
  // For now, just return the template with a mock ID if it's a new template
  if (!template.id) {
    const newTemplate: Template = {
      id: Date.now(),
      name: template.name || 'Untitled Template',
      description: template.description || '',
      category: template.category || 'Corporate',
      isActive: template.isActive || false,
      baseImageUrl: template.baseImageUrl || 'https://placehold.co/600x400/gray/white?text=Blank+Template',
      dimensions: template.dimensions || '11x8.5',
      createdAt: new Date().toISOString(),
      customizationZones: template.customizationZones || []
    };
    mockTemplates.push(newTemplate);
    return newTemplate;
  } else {
    // Update existing template
    const index = mockTemplates.findIndex(t => t.id === template.id);
    if (index >= 0) {
      mockTemplates[index] = { ...mockTemplates[index], ...template };
      return mockTemplates[index];
    }
    
    throw new Error(`Template with ID ${template.id} not found`);
  }
};

// Function to delete a template
export const deleteTemplate = (id: number): boolean => {
  const initialLength = mockTemplates.length;
  const index = mockTemplates.findIndex(template => template.id === id);
  
  if (index >= 0) {
    mockTemplates.splice(index, 1);
    return mockTemplates.length < initialLength;
  }
  
  return false;
};

// Function to export template as JSON
export const exportTemplateAsJson = (id: number): string => {
  const template = getTemplateById(id);
  if (!template) {
    throw new Error(`Template with ID ${id} not found`);
  }
  
  return JSON.stringify(template, null, 2);
};
