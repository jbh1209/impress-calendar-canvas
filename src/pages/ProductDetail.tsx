import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { getProductById } from "@/services/productService";
import { Product } from "@/services/types/productTypes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { getOrCreateActiveCart, addCartItem } from "@/services/cartService";
import { pitchprintService } from "@/services/pitchprintService";
import ImageWithFallback from "@/components/ImageWithFallback";
import { formatZAR } from "@/utils/currency";
import { Truck, Shield, RefreshCw, Star, Heart, Share2 } from "lucide-react";
const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const data = await getProductById(id);
      setProduct(data);
      
      // Enhanced SEO
      if (data) {
        document.title = `${data.name} | Impress Calendars`;
        
        // Meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          metaDesc.setAttribute('content', data.description || `${data.name} - Custom calendar design from Impress Calendars. High-quality printing and fast delivery.`);
        }
        
        // Canonical URL
        const canonical = document.querySelector('link[rel="canonical"]') || document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        canonical.setAttribute('href', `${window.location.origin}/products/${id}`);
        if (!document.querySelector('link[rel="canonical"]')) {
          document.head.appendChild(canonical);
        }
      }
      
      setLoading(false);
    })();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product || addingToCart) return;
    
    setAddingToCart(true);
    try {
      const cart = await getOrCreateActiveCart();
      if (!cart) {
        toast.error("Please sign in to add items to your cart");
        return;
      }
      const item = await addCartItem(cart.id, product.id, 1, Number(product.base_price));
      if (item) {
        toast.success(`${product.name} added to cart`);
      }
    } catch (error) {
      toast.error("Failed to add item to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleCustomize = async () => {
    if (!product?.pitchprint_design_id) {
      toast.error("No design linked to this product yet");
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to customize");
      return;
    }

    const returnUrl = `${window.location.origin}/customize/callback?product_id=${product.id}`;
    const url = pitchprintService.generateCustomizationUrl(product.pitchprint_design_id, {
      userId: user.id,
      returnUrl
    });
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="grid gap-8 md:grid-cols-2">
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!product) return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <p className="text-muted-foreground">The product you're looking for doesn't exist.</p>
        </div>
      </main>
      <Footer />
    </div>
  );

  const images = product.images || [];
  const selectedImage = images[selectedImageIndex];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-square bg-muted relative group">
                  {selectedImage?.image_url ? (
                    <ImageWithFallback
                      src={selectedImage.image_url}
                      alt={selectedImage.alt_text || product.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-2 bg-muted-foreground/20 rounded-lg flex items-center justify-center">
                          📷
                        </div>
                        <p>No image available</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <ImageWithFallback
                      src={image.image_url}
                      alt={image.alt_text || `${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold leading-tight">{product.name}</h1>
                  {product.category && (
                    <Badge variant="secondary" className="mt-2">
                      {product.category}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold">{formatZAR(Number(product.base_price))}</div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">(4.9)</span>
                </div>
              </div>
            </div>

            {product.description && (
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}

            {product.requires_customization && product.customization_help_text && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <p className="text-sm text-blue-700">{product.customization_help_text}</p>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {product.requires_customization ? (
                <Button onClick={handleCustomize} size="lg" className="w-full">
                  Customize with PitchPrint
                </Button>
              ) : (
                <Button 
                  onClick={handleAddToCart} 
                  size="lg" 
                  className="w-full"
                  disabled={addingToCart}
                >
                  {addingToCart ? "Adding..." : "Add to Cart"}
                </Button>
              )}
            </div>

            {/* Product Features */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3 text-sm">
                    <Truck className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">Free Shipping</div>
                      <div className="text-muted-foreground text-xs">On orders over R500</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <RefreshCw className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">Easy Returns</div>
                      <div className="text-muted-foreground text-xs">30-day return policy</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Shield className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">Secure Checkout</div>
                      <div className="text-muted-foreground text-xs">SSL encrypted</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Details */}
            {(product.dimensions || product.tags?.length) && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Product Details</h3>
                  <div className="space-y-2 text-sm">
                    {product.dimensions && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dimensions:</span>
                        <span>{product.dimensions}</span>
                      </div>
                    )}
                    {product.tags?.length && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tags:</span>
                        <div className="flex gap-1 flex-wrap">
                          {product.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
