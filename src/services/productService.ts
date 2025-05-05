
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Product, 
  ProductRow, 
  ProductVariant, 
  ProductVariantRow,
  ProductImage,
  ProductImageRow,
  ProductTemplateAssociation,
  ProductTemplateRow
} from "./types/productTypes";
import { Template } from "./types/templateTypes";
import { getTemplateById } from "./templateService";

/**
 * Get product by ID with its associated data
 */
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    // Fetch the product
    const { data: product, error: productError } = await supabase
      .from('products' as any)
      .select('*')
      .eq('id', id)
      .single();
      
    if (productError) {
      console.error('Error fetching product:', productError);
      toast.error('Failed to load product');
      return null;
    }
    
    if (!product) {
      return null;
    }
    
    // Fetch product variants
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants' as any)
      .select('*')
      .eq('product_id', id);
    
    if (variantsError) {
      console.error('Error fetching product variants:', variantsError);
    }
    
    // Fetch product images
    const { data: images, error: imagesError } = await supabase
      .from('product_images' as any)
      .select('*')
      .eq('product_id', id)
      .order('display_order', { ascending: true });
    
    if (imagesError) {
      console.error('Error fetching product images:', imagesError);
    }
    
    // Fetch template associations
    const { data: templateAssociations, error: templatesError } = await supabase
      .from('product_templates' as any)
      .select('*')
      .eq('product_id', id);
    
    if (templatesError) {
      console.error('Error fetching product templates:', templatesError);
    }
    
    // Fetch template details for each associated template
    const templatesWithDetails = [];
    if (templateAssociations && templateAssociations.length > 0) {
      for (const assoc of templateAssociations as ProductTemplateRow[]) {
        const template = await getTemplateById(assoc.template_id);
        templatesWithDetails.push({
          ...assoc,
          template
        });
      }
    }
    
    // Convert the database rows to our type
    const productData: Product = {
      ...(product as unknown as ProductRow),
      variants: (variants || []) as ProductVariant[],
      images: (images || []) as ProductImage[],
      templates: templatesWithDetails
    };
    
    return productData;
  } catch (error) {
    console.error('Unexpected error fetching product:', error);
    toast.error('An unexpected error occurred');
    return null;
  }
};

/**
 * Get all products with optional associated data
 */
export const getAllProducts = async (
  includeVariants = false, 
  includeImages = false,
  includeTemplates = false
): Promise<Product[]> => {
  try {
    const { data: products, error: productsError } = await supabase
      .from('products' as any)
      .select('*')
      .order('name', { ascending: true });
      
    if (productsError) {
      console.error('Error fetching products:', productsError);
      toast.error('Failed to load products');
      return [];
    }
    
    if (!products || products.length === 0) {
      return [];
    }
    
    if (!includeVariants && !includeImages && !includeTemplates) {
      return products as unknown as ProductRow[];
    }
    
    // Fetch additional data for each product
    const productsWithData: Product[] = [];
    
    for (const product of products as unknown as ProductRow[]) {
      let variants = undefined;
      let images = undefined;
      let templates = undefined;
      
      if (includeVariants) {
        const { data: variantsData } = await supabase
          .from('product_variants' as any)
          .select('*')
          .eq('product_id', product.id);
        
        variants = variantsData as unknown as ProductVariant[];
      }
      
      if (includeImages) {
        const { data: imagesData } = await supabase
          .from('product_images' as any)
          .select('*')
          .eq('product_id', product.id)
          .order('display_order', { ascending: true });
        
        images = imagesData as unknown as ProductImage[];
      }
      
      if (includeTemplates) {
        const { data: templateAssociations } = await supabase
          .from('product_templates' as any)
          .select('*')
          .eq('product_id', product.id);
        
        templates = templateAssociations as unknown as ProductTemplateAssociation[];
      }
      
      productsWithData.push({
        ...product,
        variants,
        images,
        templates
      });
    }
    
    return productsWithData;
  } catch (error) {
    console.error('Unexpected error fetching products:', error);
    toast.error('An unexpected error occurred');
    return [];
  }
};

/**
 * Save a product and its associated data
 */
export const saveProduct = async (product: Partial<Product>): Promise<Product | null> => {
  try {
    const user = supabase.auth.getUser();
    const userId = (await user).data.user?.id;
    
    const isNewProduct = !product.id;
    const variants = product.variants || [];
    const images = product.images || [];
    const templates = product.templates || [];
    
    // Remove associated data from product object for insert/update
    const productToSave = { ...product };
    delete productToSave.variants;
    delete productToSave.images;
    delete productToSave.templates;
    
    // For new products, add created_by field
    if (isNewProduct && userId) {
      productToSave.created_by = userId;
    }
    
    // Insert or update the product
    let productResult;
    
    if (isNewProduct) {
      productResult = await supabase
        .from('products' as any)
        .insert([productToSave])
        .select()
        .single();
    } else {
      productResult = await supabase
        .from('products' as any)
        .update(productToSave)
        .eq('id', product.id!)
        .select()
        .single();
    }
    
    const { data: savedProduct, error } = productResult;
    
    if (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
      return null;
    }
    
    if (!savedProduct) {
      toast.error('No data returned after saving product');
      return null;
    }
    
    // Save variants if they exist
    if (variants.length > 0) {
      // First, remove existing variants if updating
      if (!isNewProduct) {
        await supabase
          .from('product_variants' as any)
          .delete()
          .eq('product_id', savedProduct.id);
      }
      
      // Insert new variants
      for (const variant of variants) {
        const variantToSave = {
          ...variant,
          product_id: savedProduct.id
        };
        
        delete variantToSave.id;
        
        await supabase
          .from('product_variants' as any)
          .insert([variantToSave]);
      }
    }
    
    // Save images if they exist
    if (images.length > 0) {
      // First, remove existing images if updating
      if (!isNewProduct) {
        await supabase
          .from('product_images' as any)
          .delete()
          .eq('product_id', savedProduct.id);
      }
      
      // Insert new images
      for (const image of images) {
        const imageToSave = {
          ...image,
          product_id: savedProduct.id
        };
        
        delete imageToSave.id;
        
        await supabase
          .from('product_images' as any)
          .insert([imageToSave]);
      }
    }
    
    // Save template associations if they exist
    if (templates.length > 0) {
      // First, remove existing template associations if updating
      if (!isNewProduct) {
        await supabase
          .from('product_templates' as any)
          .delete()
          .eq('product_id', savedProduct.id);
      }
      
      // Insert new template associations
      for (const template of templates) {
        if (!template.template_id) continue;
        
        await supabase
          .from('product_templates' as any)
          .insert([{
            product_id: savedProduct.id,
            template_id: template.template_id,
            is_default: template.is_default || false
          }]);
      }
    }
    
    // Reload the product with its associations
    return await getProductById(savedProduct.id);
  } catch (error) {
    console.error('Unexpected error saving product:', error);
    toast.error('An unexpected error occurred while saving');
    return null;
  }
};

/**
 * Delete a product (and its associated data via cascade)
 */
export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('products' as any)
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error deleting product:', error);
    toast.error('An unexpected error occurred');
    return false;
  }
};

/**
 * Associate a template with a product
 */
export const associateTemplateWithProduct = async (
  productId: string, 
  templateId: string, 
  isDefault = false
): Promise<boolean> => {
  try {
    // Check if association already exists
    const { data: existingAssoc } = await supabase
      .from('product_templates' as any)
      .select('*')
      .eq('product_id', productId)
      .eq('template_id', templateId)
      .single();
    
    if (existingAssoc) {
      // Update is_default if needed
      if (existingAssoc.is_default !== isDefault) {
        const { error } = await supabase
          .from('product_templates' as any)
          .update({ is_default: isDefault })
          .eq('id', existingAssoc.id);
          
        if (error) {
          console.error('Error updating template association:', error);
          toast.error('Failed to update template association');
          return false;
        }
      }
      return true;
    }
    
    // Create new association
    const { error } = await supabase
      .from('product_templates' as any)
      .insert([{
        product_id: productId,
        template_id: templateId,
        is_default: isDefault
      }]);
      
    if (error) {
      console.error('Error associating template with product:', error);
      toast.error('Failed to associate template with product');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error associating template with product:', error);
    toast.error('An unexpected error occurred');
    return false;
  }
};

/**
 * Get all templates associated with a product
 */
export const getTemplatesByProductId = async (productId: string): Promise<Template[]> => {
  try {
    const { data: associations, error } = await supabase
      .from('product_templates' as any)
      .select('template_id')
      .eq('product_id', productId);
      
    if (error) {
      console.error('Error fetching template associations:', error);
      toast.error('Failed to load template associations');
      return [];
    }
    
    if (!associations || associations.length === 0) {
      return [];
    }
    
    // Fetch template details for each template ID
    const templates: Template[] = [];
    for (const assoc of associations) {
      const template = await getTemplateById(assoc.template_id);
      if (template) {
        templates.push(template);
      }
    }
    
    return templates;
  } catch (error) {
    console.error('Unexpected error fetching templates for product:', error);
    toast.error('An unexpected error occurred');
    return [];
  }
};

// Export product types
export type { 
  Product, 
  ProductVariant, 
  ProductImage, 
  ProductTemplateAssociation 
} from "./types/productTypes";
