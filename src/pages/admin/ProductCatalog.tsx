
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Product Catalog</h1>
        <Button onClick={() => navigate("/admin/products/new")} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Create Product
        </Button>
      </div>
      
      <div className="max-w-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                  <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
                    {product.thumbnail_url ? (
                      <img 
                        src={product.thumbnail_url} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <CalendarRange className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                    {!product.is_active && (
                      <Badge 
                        variant="secondary" 
                        className="absolute top-2 right-2 bg-gray-100 text-gray-700"
                      >
                        Draft
                      </Badge>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{product.name}</h3>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600">{product.category}</Badge>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        R{product.base_price.toFixed(2)}
                      </span>
                    </div>
                    
                    <Separator className="my-3 bg-gray-200 dark:bg-gray-600" />
                    
                    <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 h-10 mb-2">
                      {product.description || "No description"}
                    </div>
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <span>{product.templates?.length || 0} templates</span>
                      <span className="mx-1">•</span>
                      <span>{product.variants?.length || 0} variants</span>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="border-t border-gray-200 dark:border-gray-700 p-4">
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
              <CalendarRange className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No products found</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
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
