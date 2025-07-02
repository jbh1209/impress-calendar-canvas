// Re-export types from services for consistency
export type { TemplatePage, CustomizationZone as Zone } from '@/services/types/templateTypes';

export interface TemplateState {
  id: string;
  name: string;
  description: string;
  category: string;
  dimensions: string;
  units: string;
  isActive: boolean;
}