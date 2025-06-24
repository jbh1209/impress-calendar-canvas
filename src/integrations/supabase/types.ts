export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      customization_zones: {
        Row: {
          created_at: string
          height: number
          id: string
          name: string
          template_id: string
          type: string
          updated_at: string
          width: number
          x: number
          y: number
          z_index: number
        }
        Insert: {
          created_at?: string
          height: number
          id?: string
          name: string
          template_id: string
          type: string
          updated_at?: string
          width: number
          x: number
          y: number
          z_index?: number
        }
        Update: {
          created_at?: string
          height?: number
          id?: string
          name?: string
          template_id?: string
          type?: string
          updated_at?: string
          width?: number
          x?: number
          y?: number
          z_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "customization_zones_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          display_order: number
          id: string
          image_url: string
          product_id: string
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          product_id: string
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_templates: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          product_id: string
          template_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          product_id: string
          template_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          product_id?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_templates_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_templates_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          created_at: string
          id: string
          name: string
          price_adjustment: number
          product_id: string
          sku: string | null
          stock_quantity: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          price_adjustment?: number
          product_id: string
          sku?: string | null
          stock_quantity?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          price_adjustment?: number
          product_id?: string
          sku?: string | null
          stock_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          dimensions: string | null
          id: string
          is_active: boolean
          name: string
          tags: string[] | null
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          base_price: number
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          dimensions?: string | null
          id?: string
          is_active?: boolean
          name: string
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          base_price?: number
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          dimensions?: string | null
          id?: string
          is_active?: boolean
          name?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      shutterstock_licenses: {
        Row: {
          download_url: string | null
          expires_at: string | null
          id: string
          image_id: string
          license_id: string | null
          license_type: string
          order_id: string | null
          price: number | null
          purchased_at: string | null
          user_id: string
        }
        Insert: {
          download_url?: string | null
          expires_at?: string | null
          id?: string
          image_id: string
          license_id?: string | null
          license_type: string
          order_id?: string | null
          price?: number | null
          purchased_at?: string | null
          user_id: string
        }
        Update: {
          download_url?: string | null
          expires_at?: string | null
          id?: string
          image_id?: string
          license_id?: string | null
          license_type?: string
          order_id?: string | null
          price?: number | null
          purchased_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      shutterstock_selections: {
        Row: {
          created_at: string
          id: string
          image_id: string
          preview_url: string
          thumbnail_url: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_id: string
          preview_url: string
          thumbnail_url: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_id?: string
          preview_url?: string
          thumbnail_url?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      template_pages: {
        Row: {
          created_at: string
          id: string
          page_number: number
          pdf_page_height: number | null
          pdf_page_width: number | null
          pdf_units: string | null
          preview_image_url: string | null
          template_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          page_number: number
          pdf_page_height?: number | null
          pdf_page_width?: number | null
          pdf_units?: string | null
          preview_image_url?: string | null
          template_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          page_number?: number
          pdf_page_height?: number | null
          pdf_page_width?: number | null
          pdf_units?: string | null
          preview_image_url?: string | null
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_pages_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          base_image_url: string | null
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          dimensions: string | null
          id: string
          is_active: boolean
          name: string
          original_pdf_url: string | null
          pdf_metadata: Json | null
          updated_at: string
        }
        Insert: {
          base_image_url?: string | null
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          dimensions?: string | null
          id?: string
          is_active?: boolean
          name: string
          original_pdf_url?: string | null
          pdf_metadata?: Json | null
          updated_at?: string
        }
        Update: {
          base_image_url?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          dimensions?: string | null
          id?: string
          is_active?: boolean
          name?: string
          original_pdf_url?: string | null
          pdf_metadata?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      zone_page_assignments: {
        Row: {
          height: number
          id: string
          is_repeating: boolean
          page_id: string
          width: number
          x: number
          y: number
          z_index: number
          zone_id: string
        }
        Insert: {
          height: number
          id?: string
          is_repeating?: boolean
          page_id: string
          width: number
          x: number
          y: number
          z_index?: number
          zone_id: string
        }
        Update: {
          height?: number
          id?: string
          is_repeating?: boolean
          page_id?: string
          width?: number
          x?: number
          y?: number
          z_index?: number
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "zone_page_assignments_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "template_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zone_page_assignments_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "customization_zones"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
