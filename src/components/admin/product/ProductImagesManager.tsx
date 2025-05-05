
import { useState } from "react";
import { PlusCircle, X, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductImage } from "@/services/productService";

interface ProductImagesManagerProps {
  productId?: string;
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
}

const ProductImagesManager = ({ productId, images, onChange }: ProductImagesManagerProps) => {
  const [newImage, setNewImage] = useState<Partial<ProductImage>>({
    image_url: '',
    alt_text: ''
  });

  const handleAddImage = () => {
    if (!newImage.image_url) return;
    
    const imageToAdd = {
      ...newImage,
      id: `temp-${Date.now()}`, // Temporary ID for client-side only
      product_id: productId || '',
      display_order: images.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as ProductImage;

    onChange([...images, imageToAdd]);
    setNewImage({ image_url: '', alt_text: '' });
  };

  const handleRemoveImage = (id: string) => {
    onChange(images.filter(img => img.id !== id));
  };

  const handleMoveImage = (currentIndex: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && currentIndex === 0) || 
      (direction === 'down' && currentIndex === images.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newImages = [...images];
    const [movedImage] = newImages.splice(currentIndex, 1);
    newImages.splice(newIndex, 0, movedImage);
    
    // Update display order for all images
    const updatedImages = newImages.map((img, idx) => ({
      ...img,
      display_order: idx
    }));
    
    onChange(updatedImages);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Product Images</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                value={newImage.image_url || ''}
                onChange={(e) => setNewImage({...newImage, image_url: e.target.value})}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div>
              <Label htmlFor="alt-text">Alt Text</Label>
              <Input
                id="alt-text"
                value={newImage.alt_text || ''}
                onChange={(e) => setNewImage({...newImage, alt_text: e.target.value})}
                placeholder="Image description"
              />
            </div>
          </div>
          
          <div>
            <Button 
              variant="outline" 
              onClick={handleAddImage}
              disabled={!newImage.image_url}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Image
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            {images.map((image, index) => (
              <div key={image.id} className="relative group border rounded-md">
                <img
                  src={image.image_url}
                  alt={image.alt_text || "Product image"}
                  className="w-full h-40 object-cover rounded-t-md"
                />
                <div className="p-2 flex justify-between items-center">
                  <div className="text-xs truncate">{image.alt_text || "No description"}</div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={index === 0}
                      onClick={() => handleMoveImage(index, 'up')}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={index === images.length - 1}
                      onClick={() => handleMoveImage(index, 'down')}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveImage(image.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {images.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No images added yet. Add product images to showcase to customers.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductImagesManager;
