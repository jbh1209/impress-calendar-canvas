import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { getProductById } from "@/services/productService";
import { Product } from "@/services/types/productTypes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { getOrCreateActiveCart, addCartItem } from "@/services/cartService";
import { pitchprintService } from "@/services/pitchprintService";
import ImageWithFallback from "@/components/ImageWithFallback";
import { Truck, Shield, RefreshCw } from "lucide-react";
const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const data = await getProductById(id);
      setProduct(data);
      document.title = data ? `${data.name} | Impress` : "Product | Impress";
      setLoading(false);
    })();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    const cart = await getOrCreateActiveCart();
    if (!cart) {
      toast.error("Please sign in to add items to your cart");
      return;
    }
    const item = await addCartItem(cart.id, product.id, 1, Number(product.base_price));
    if (item) toast.success("Added to cart");
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

  if (loading) return <div className="container mx-auto p-6">Loading...</div>;
  if (!product) return <div className="container mx-auto p-6">Product not found.</div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-square bg-muted">
                {product.images?.[0]?.image_url ? (
                  <ImageWithFallback
                    src={product.images[0].image_url}
                    alt={product.images[0].alt_text || product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="space-y-6">
            <h1 className="text-3xl lg:text-4xl">{product.name}</h1>
            <div className="text-2xl font-semibold">R {Number(product.base_price).toFixed(2)}</div>
            <div className="flex gap-3">
              {product.requires_customization ? (
                <Button onClick={handleCustomize}>Customize with PitchPrint</Button>
              ) : (
                <Button onClick={handleAddToCart}>Add to Cart</Button>
              )}
            </div>
            {product.requires_customization && product.customization_help_text && (
              <p className="text-sm text-muted-foreground">{product.customization_help_text}</p>
            )}
            {product.description && (
              <p className="text-muted-foreground">{product.description}</p>
            )}

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
                <span>Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
