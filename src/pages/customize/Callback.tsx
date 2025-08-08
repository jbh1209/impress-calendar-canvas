import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { upsertPitchPrintProject } from "@/services/pitchprintProjectService";
import { getOrCreateActiveCart, addCartItem } from "@/services/cartService";
import { getProductById } from "@/services/productService";

const PitchPrintCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const projectId = params.get("project_id") || params.get("project") || "";
    const productId = params.get("product_id") || params.get("product") || "";
    const previewUrl = params.get("preview_url") || undefined;

    if (!projectId || !productId) {
      toast.error("Missing project or product reference from PitchPrint");
      navigate("/", { replace: true });
      return;
    }

    (async () => {
      try {
        // 1) Load product to get pricing
        const product = await getProductById(productId);
        if (!product) {
          toast.error("Product not found for customization");
          navigate("/products", { replace: true });
          return;
        }

        // 2) Ensure user has an active cart
        const cart = await getOrCreateActiveCart();
        if (!cart) {
          toast.error("Please sign in to add your customized item to cart");
          navigate(`/products/${productId}`, { replace: true });
          return;
        }

        // 3) Add item to cart with base price
        const cartItem = await addCartItem(cart.id, productId, 1, Number(product.base_price));
        if (!cartItem) {
          toast.error("Could not add item to cart");
          navigate(`/products/${productId}`, { replace: true });
          return;
        }

        // 4) Save/associate PitchPrint project with the new cart item
        const { ok } = await upsertPitchPrintProject({
          projectId,
          productId,
          status: "completed",
          previewUrl,
          cartItemId: cartItem.id,
        });

        if (ok) {
          toast.success("Design saved and added to your cart");
          navigate("/cart", { replace: true });
        } else {
          toast.error("Couldn't save your design. Please try again.");
          navigate(`/products/${productId}`, { replace: true });
        }
      } catch (e) {
        console.error("PitchPrint callback error", e);
        toast.error("Something went wrong processing your design");
        navigate(`/products/${productId}`, { replace: true });
      }
    })();
  }, [location.search, navigate]);

  return null;
};

export default PitchPrintCallback;

