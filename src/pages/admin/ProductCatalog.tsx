
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Search, CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Product, getAllProducts } from "@/services/productService";

const ProductCatalog = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      const allProducts = await getAllProducts(true, true, true);
      setProducts(allProducts);
      setIsLoading(false);
    };
    
    loadProducts();
  }, []);
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Catalog</h1>
        <Button onClick={() => navigate("/admin/products/new")}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Product
        </Button>
      </div>
      
      <div className="max-w-lg mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-40 bg-muted rounded-t-md" />
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="relative h-48 bg-muted">
                    {product.thumbnail_url ? (
                      <img 
                        src={product.thumbnail_url} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <CalendarRange className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    {!product.is_active && (
                      <Badge 
                        variant="secondary" 
                        className="absolute top-2 right-2"
                      >
                        Draft
                      </Badge>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{product.name}</h3>
                    <div className="flex items-center mt-1">
                      <Badge variant="outline">{product.category}</Badge>
                      <span className="ml-auto font-semibold">
                        R{product.base_price.toFixed(2)}
                      </span>
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div className="text-sm text-muted-foreground line-clamp-2 h-10">
                      {product.description || "No description"}
                    </div>
                    
                    <div className="mt-2 text-xs text-muted-foreground">
                      <span>{product.templates?.length || 0} templates</span>
                      <span className="mx-1">•</span>
                      <span>{product.variants?.length || 0} variants</span>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="border-t p-4">
                    <Button 
                      className="w-full" 
                      onClick={() => navigate(`/admin/products/${product.id}`)}
                    >
                      Edit Product
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CalendarRange className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No products found</h3>
              <p className="mt-2 text-muted-foreground">
                {searchQuery 
                  ? "Try adjusting your search or filters."
                  : "Get started by creating a new product."
                }
              </p>
              <Button 
                className="mt-4" 
                onClick={() => navigate("/admin/products/new")}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Product
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductCatalog;
