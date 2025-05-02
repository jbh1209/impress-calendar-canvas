
import { supabase } from "@/integrations/supabase/client";

export interface ShutterstockSearchOptions {
  perPage?: number;
  page?: number;
  filters?: {
    category?: string;
    orientation?: string;
    color?: string;
    [key: string]: string | undefined;
  };
}

export interface ShutterstockImage {
  id: string;
  description: string;
  assets: {
    preview: {
      url: string;
    };
    preview_1000: {
      url: string;
    };
    small_thumb: {
      url: string;
    };
    large_thumb: {
      url: string;
    };
  };
}

export interface ShutterstockSearchResponse {
  data: ShutterstockImage[];
  page: number;
  per_page: number;
  total_count: number;
  search_id: string;
}

export interface ShutterstockLicense {
  id: string;
  image_id: string;
  download_url: string;
  created_at: string;
}

export const shutterstockService = {
  async search(query: string, options: ShutterstockSearchOptions = {}): Promise<ShutterstockSearchResponse> {
    const { data, error } = await supabase.functions.invoke('shutterstock', {
      body: {
        action: 'search',
        query,
        options
      }
    });
    
    if (error) throw new Error(error.message);
    return data;
  },

  async licenseImage(imageId: string, licenseType: string = 'standard'): Promise<ShutterstockLicense> {
    const { data, error } = await supabase.functions.invoke('shutterstock', {
      body: {
        action: 'license',
        imageId,
        licenseType
      }
    });
    
    if (error) throw new Error(error.message);
    return data;
  },

  async saveSelection(imageId: string, thumbnailUrl: string, previewUrl: string): Promise<void> {
    const { error } = await supabase
      .from('shutterstock_selections')
      .insert({
        image_id: imageId,
        thumbnail_url: thumbnailUrl,
        preview_url: previewUrl
      });
    
    if (error) throw new Error(error.message);
  },

  async getUserSelections() {
    const { data, error } = await supabase
      .from('shutterstock_selections')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data || [];
  },

  async removeSelection(id: string): Promise<void> {
    const { error } = await supabase
      .from('shutterstock_selections')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
  }
};
