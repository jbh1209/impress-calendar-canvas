import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getProductById } from "@/services/productService";
import { Product } from "@/services/types/productTypes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { getOrCreateActiveCart, addCartItem } from "@/services/cartService";
import { pitchprintService } from "@/services/pitchprintService";

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
    <main className="container mx-auto p-6">
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="aspect-[4/3] bg-gray-100">
              {product.images?.[0]?.image_url ? (
                <img src={product.images[0].image_url} alt={product.images[0].alt_text || product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
              )}
            </div>
          </CardContent>
        </Card>
        <div>
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <div className="text-xl font-semibold mb-6">R {Number(product.base_price).toFixed(2)}</div>
          <div className="flex gap-3">
            {product.requires_customization ? (
              <Button onClick={handleCustomize}>Customize with PitchPrint</Button>
            ) : (
              <Button onClick={handleAddToCart}>Add to Cart</Button>
            )}
          </div>
          {product.requires_customization && product.customization_help_text && (
            <p className="text-sm text-gray-500 mt-4">{product.customization_help_text}</p>
          )}
        </div>
      </div>
    </main>
  );
};

export default ProductDetail;
