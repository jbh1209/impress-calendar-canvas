import { supabase } from "@/integrations/supabase/client";

export interface PitchPrintDesign {
  id: string;
  name: string;
  thumbnail?: string;
  preview_url?: string;
}

export interface PitchPrintProject {
  id: string;
  design_id: string;
  customer_data: any;
  pdf_url?: string;
}

export interface PitchPrintCategory {
  id: string;
  name: string;
  description?: string;
}

export interface PitchPrintDesignList {
  designs: PitchPrintDesign[];
  total: number;
  page: number;
}

class PitchPrintService {
  async validateDesignId(designId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('pitchprint-api', {
        body: {
          action: 'validate_design',
          design_id: designId
        }
      });

      if (error) {
        console.error('Error validating design:', error);
        return false;
      }

      return data?.valid || false;
    } catch (error) {
      console.error('Error validating PitchPrint design:', error);
      return false;
    }
  }

  async getDesignPreview(designId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('pitchprint-api', {
        body: {
          action: 'get_design_preview',
          design_id: designId
        }
      });

      if (error) {
        console.error('Error getting design preview:', error);
        return null;
      }

      return data?.preview_url || null;
    } catch (error) {
      console.error('Error getting PitchPrint design preview:', error);
      return null;
    }
  }

  async generateProjectPdf(projectId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('pitchprint-api', {
        body: {
          action: 'generate_pdf',
          project_id: projectId
        }
      });

      if (error) {
        console.error('Error generating PDF:', error);
        return null;
      }

      return data?.pdf_url || null;
    } catch (error) {
      console.error('Error generating PitchPrint PDF:', error);
      return null;
    }
  }

  async fetchDesignCategories(): Promise<PitchPrintCategory[]> {
    try {
      const { data, error } = await supabase.functions.invoke('pitchprint-api', {
        body: {
          action: 'fetch_design_categories'
        }
      });

      if (error) {
        console.error('Error fetching design categories:', error);
        return [];
      }

      console.log('Fetched categories data:', data);
      return Array.isArray(data?.categories) ? data.categories : [];
    } catch (error) {
      console.error('Error fetching PitchPrint design categories:', error);
      return [];
    }
  }

  async fetchDesigns(categoryId?: string): Promise<PitchPrintDesignList> {
    try {
      const { data, error } = await supabase.functions.invoke('pitchprint-api', {
        body: {
          action: 'fetch_designs',
          ...(categoryId && { category_id: categoryId })
        }
      });

      if (error) {
        console.error('Error fetching designs:', error);
        return { designs: [], total: 0, page: 1 };
      }

      console.log('Fetched designs data:', data);
      
      // Handle both array response and object response formats
      if (Array.isArray(data?.designs)) {
        return {
          designs: data.designs,
          total: data.total || data.designs.length,
          page: data.page || 1
        };
      } else if (data?.designs && typeof data.designs === 'object') {
        return data.designs;
      }
      
      return { designs: [], total: 0, page: 1 };
    } catch (error) {
      console.error('Error fetching PitchPrint designs:', error);
      return { designs: [], total: 0, page: 1 };
    }
  }

  generateCustomizationUrl(designId: string, options: {
    userId?: string;
    orderId?: string;
    returnUrl?: string;
  } = {}): string {
    const baseUrl = 'https://api.pitchprint.io/runtime/client-demo.html';
    const params = new URLSearchParams({
      design_id: designId,
      mode: 'edit',
      ...(options.userId && { user_id: options.userId }),
      ...(options.orderId && { order_id: options.orderId }),
      ...(options.returnUrl && { return_url: options.returnUrl })
    });

    return `${baseUrl}?${params.toString()}`;
  }
}

export const pitchprintService = new PitchPrintService();