
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PlusCircle, ArrowLeft, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Product, ProductVariant, getAllProducts, getProductById, saveProduct, deleteProduct } from "@/services/productService";
import ProductForm from "@/components/admin/product/ProductForm";

const ProductManagement = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  
  const [product, setProduct] = useState<Partial<Product>>({
    name: "",
    description: "",
    category: "Corporate",
    base_price: 0,
    dimensions: "A4",
    is_active: false,
    variants: [],
    images: [],
    templates: []
  });
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  useEffect(() => {
    // Load all products for sidebar
    const loadProducts = async () => {
      setIsLoading(true);
      const allProducts = await getAllProducts();
      setProducts(allProducts);
      setIsLoading(false);
    };
    
    loadProducts();
  }, []);
  
  useEffect(() => {
    // Load specific product if ID is provided
    const loadProduct = async () => {
      if (!productId) return;
      
      setIsLoading(true);
      const loadedProduct = await getProductById(productId);
      
      if (loadedProduct) {
        setProduct(loadedProduct);
      } else {
        toast.error("Product not found");
        navigate("/admin/products");
      }
      
      setIsLoading(false);
    };
    
    loadProduct();
  }, [productId, navigate]);
  
  const handleSave = async () => {
    if (!product.name) {
      toast.error("Product name is required");
      return;
    }
    
    if (product.base_price === undefined || product.base_price < 0) {
      toast.error("Valid base price is required");
      return;
    }
    
    setIsSaving(true);
    
    const savedProduct = await saveProduct(product);
    
    if (savedProduct) {
      toast.success(`Product ${productId ? "updated" : "created"} successfully`);
      
      // Redirect to the edit page if this was a new product
      if (!productId) {
        navigate(`/admin/products/${savedProduct.id}`);
      } else {
        // Refresh product list and current product
        setProduct(savedProduct);
        const allProducts = await getAllProducts();
        setProducts(allProducts);
      }
    }
    
    setIsSaving(false);
  };
  
  const handleDelete = async () => {
    if (!productId) return;
    
    const success = await deleteProduct(productId);
    
    if (success) {
      toast.success("Product deleted successfully");
      navigate("/admin/products");
    }
    
    setShowDeleteDialog(false);
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/admin/products")}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
          <h1 className="text-2xl font-bold">
            {productId ? "Edit Product" : "Create New Product"}
          </h1>
        </div>
        
        {productId && (
          <Button 
            variant="destructive" 
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete Product
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1">
          <Card>
            <CardContent className="p-4">
              <div className="font-semibold mb-4">All Products</div>
              <Button 
                variant="secondary"
                className="w-full mb-4"
                onClick={() => navigate("/admin/products/new")}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                New Product
              </Button>
              <Separator className="mb-4" />
              
              {isLoading ? (
                <div className="text-center py-4">Loading...</div>
              ) : (
                <ul className="space-y-1">
                  {products.map((p) => (
                    <li key={p.id}>
                      <Button 
                        variant={p.id === productId ? "default" : "ghost"}
                        className="w-full justify-start text-left"
                        onClick={() => navigate(`/admin/products/${p.id}`)}
                      >
                        <span className="truncate">{p.name}</span>
                      </Button>
                    </li>
                  ))}
                  
                  {products.length === 0 && (
                    <li className="text-center py-4 text-muted-foreground">
                      No products found
                    </li>
                  )}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="col-span-3">
          {isLoading ? (
            <div className="text-center py-12">Loading product details...</div>
          ) : (
            <ProductForm
              product={product}
              onProductChange={setProduct}
              onSave={handleSave}
              onCancel={() => navigate("/admin/products")}
              isSaving={isSaving}
            />
          )}
        </div>
      </div>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the 
              product and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductManagement;
