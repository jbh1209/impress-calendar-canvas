
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product, ProductVariant } from "@/services/productService";

import ProductVariantsTable from "./ProductVariantsTable";
import ProductImagesManager from "./ProductImagesManager";

interface ProductFormProps {
  product: Partial<Product>;
  onProductChange: (product: Partial<Product>) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

const ProductForm = ({
  product,
  onProductChange,
  onSave,
  onCancel,
  isSaving
}: ProductFormProps) => {
  const [activeTab, setActiveTab] = useState("general");
  
  const handleChange = (field: string, value: any) => {
    onProductChange({ ...product, [field]: value });
  };
  
  const handleVariantsChange = (variants: ProductVariant[]) => {
    onProductChange({ ...product, variants });
  };
  
  const handleImagesChange = (images: any[]) => {
    onProductChange({ ...product, images });
  };
  
  const handleTemplatesChange = (templates: any[]) => {
    onProductChange({ ...product, templates });
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={product.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter product name"
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={product.category || ''}
                onValueChange={(value) => handleChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Corporate">Corporate</SelectItem>
                  <SelectItem value="Personal">Personal</SelectItem>
                  <SelectItem value="Nature">Nature</SelectItem>
                  <SelectItem value="Seasonal">Seasonal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={product.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe the product"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="pitchprint_design_id">PitchPrint Design ID</Label>
            <Input
              id="pitchprint_design_id"
              value={product.pitchprint_design_id || ''}
              onChange={(e) => handleChange('pitchprint_design_id', e.target.value)}
              placeholder="Enter PitchPrint design ID"
            />
            <p className="text-sm text-muted-foreground mt-1">
              The design ID from your PitchPrint account that customers will customize
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="basePrice">Base Price (R)</Label>
              <Input
                id="basePrice"
                type="number"
                value={product.base_price || ''}
                onChange={(e) => handleChange('base_price', parseFloat(e.target.value))}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            
            <div>
              <Label htmlFor="dimensions">Dimensions</Label>
              <Select
                value={product.dimensions || ''}
                onValueChange={(value) => handleChange('dimensions', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A4">A4 (210mm x 297mm)</SelectItem>
                  <SelectItem value="A5">A5 (148mm x 210mm)</SelectItem>
                  <SelectItem value="A3">A3 (297mm x 420mm)</SelectItem>
                  <SelectItem value="Square">Square (200mm x 200mm)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="active-status"
              checked={product.is_active || false}
              onCheckedChange={(checked) => handleChange('is_active', checked)}
            />
            <Label htmlFor="active-status">Active (visible to customers)</Label>
          </div>
        </CardContent>
      </Card>
      
      <ProductVariantsTable
        variants={product.variants || []}
        onChange={handleVariantsChange}
      />
      
      <ProductImagesManager
        productId={product.id}
        images={product.images || []}
        onChange={handleImagesChange}
      />
      
      
      <CardFooter className="flex justify-end space-x-2 px-0">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={onSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Product'}
        </Button>
      </CardFooter>
    </div>
  );
};

export default ProductForm;
