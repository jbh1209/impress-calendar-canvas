import { useState } from 'react';
import { ArrowLeft, Heart, Share2, Star, Plus, Minus, ShoppingCart, Truck, Shield, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Product } from '../App';

interface ProductDetailProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number, color?: string, size?: string) => void;
  onBack: () => void;
}

export function ProductDetail({ product, onAddToCart, onBack }: ProductDetailProps) {
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleAddToCart = () => {
    onAddToCart(product, quantity, selectedColor, selectedSize);
  };

  const images = product.images || [product.image];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Products
      </Button>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-xl bg-muted">
            <ImageWithFallback
              src={images[selectedImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                    selectedImageIndex === index ? 'border-primary' : 'border-border'
                  }`}
                >
                  <ImageWithFallback
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">{product.category}</Badge>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <h1 className="text-3xl lg:text-4xl">{product.name}</h1>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2">{product.rating}</span>
              </div>
              <span className="text-muted-foreground">({product.reviews} reviews)</span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-3xl">${product.price}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    ${product.originalPrice}
                  </span>
                  <Badge className="bg-destructive">
                    Save ${product.originalPrice - product.price}
                  </Badge>
                </>
              )}
            </div>

            <p className="text-muted-foreground text-lg leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Product Options */}
          <div className="space-y-6">
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm">Color: {selectedColor}</label>
                <div className="flex items-center space-x-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-2 transition-colors ${
                        selectedColor === color ? 'border-primary' : 'border-border'
                      }`}
                      style={{
                        backgroundColor: color.toLowerCase() === 'white' ? '#ffffff' :
                                       color.toLowerCase() === 'black' ? '#000000' :
                                       color.toLowerCase() === 'gray' ? '#6b7280' :
                                       color.toLowerCase() === 'navy' ? '#1e3a8a' :
                                       color.toLowerCase() === 'blue' ? '#3b82f6' :
                                       color.toLowerCase() === 'brown' ? '#92400e' :
                                       color.toLowerCase() === 'tan' ? '#d2b48c' :
                                       color.toLowerCase() === 'silver' ? '#c0c0c0' :
                                       color.toLowerCase()
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm">Size</label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.sizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <label className="text-sm">Quantity</label>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Add to Cart */}
          <div className="space-y-4">
            <Button
              size="lg"
              className="w-full"
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>

            {product.inStock && (
              <div className="flex items-center text-sm text-green-600">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                In stock and ready to ship
              </div>
            )}
          </div>

          {/* Product Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
            <div className="flex items-center space-x-3 text-sm">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <span>Free shipping</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <RefreshCw className="h-5 w-5 text-muted-foreground" />
              <span>Easy returns</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <span>2-year warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Information Tabs */}
      <div className="mt-16">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({product.reviews})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="mt-6">
            <Card className="p-6">
              <div className="prose max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  This premium product is designed with attention to detail and quality craftsmanship. 
                  Made from the finest materials, it offers exceptional durability and performance 
                  that will exceed your expectations.
                </p>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="specifications" className="mt-6">
            <Card className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4>Product Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Brand:</span>
                      <span>STOREFRONT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span>{product.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SKU:</span>
                      <span>SF-{product.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weight:</span>
                      <span>1.2 kg</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4>Features</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Premium quality materials</li>
                    <li>• Sustainable manufacturing</li>
                    <li>• 2-year warranty included</li>
                    <li>• Free shipping worldwide</li>
                    <li>• 30-day return policy</li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4>Customer Reviews</h4>
                  <Button variant="outline">Write a Review</Button>
                </div>
                
                <div className="space-y-4">
                  {[1, 2, 3].map((review) => (
                    <div key={review} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm">J</span>
                          </div>
                          <span>John D.</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Excellent quality and fast shipping. Highly recommend this product!
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}