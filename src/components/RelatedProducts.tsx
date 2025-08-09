import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllProducts } from "@/services/productService";
import { Product } from "@/services/types/productTypes";
import ImageWithFallback from "@/components/ImageWithFallback";
import { formatZAR } from "@/utils/currency";
import { Link } from "react-router-dom";

interface RelatedProductsProps {
  currentProductId: string;
  category?: string;
}

const RelatedProducts = ({ currentProductId, category }: RelatedProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const allProducts = await getAllProducts(false, true, false);
        // Filter out current product and limit to 4 items
        const filtered = allProducts
          .filter(product => 
            product.id !== currentProductId && 
            product.is_active &&
            (!category || product.category === category)
          )
          .slice(0, 4);
        setProducts(filtered);
      } catch (error) {
        console.error('Failed to fetch related products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [currentProductId, category]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Related Products</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Related Products</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product) => {
            const primaryImage = product.images?.[0];
            
            return (
              <Link 
                key={product.id} 
                to={`/products/${product.id}`}
                className="group block"
              >
                <div className="space-y-2">
                  <Card className="overflow-hidden border-0 shadow-sm group-hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-muted relative">
                      {primaryImage?.image_url ? (
                        <ImageWithFallback
                          src={primaryImage.image_url}
                          alt={primaryImage.alt_text || product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <div className="text-center">
                            <div className="w-8 h-8 mx-auto mb-1 bg-muted-foreground/20 rounded-lg flex items-center justify-center">
                              📷
                            </div>
                            <p className="text-xs">No image</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">
                        {formatZAR(Number(product.base_price))}
                      </span>
                      {product.category && (
                        <Badge variant="secondary" className="text-xs">
                          {product.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="mt-4 text-center">
          <Button variant="outline" size="sm" asChild>
            <Link to="/products">View All Products</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RelatedProducts;