
import { useState } from "react";
import { PlusCircle, X, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ProductVariant } from "@/services/productService";

interface ProductVariantsTableProps {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
}

const ProductVariantsTable = ({ variants, onChange }: ProductVariantsTableProps) => {
  const [isAddingVariant, setIsAddingVariant] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [newVariant, setNewVariant] = useState<Partial<ProductVariant>>({
    name: "",
    price_adjustment: 0,
    stock_quantity: 0,
    sku: ""
  });

  const handleAddVariant = () => {
    const variantToAdd = {
      ...newVariant,
      id: `temp-${Date.now()}`, // Temporary ID for client-side only
      product_id: "", // Will be set on save
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as ProductVariant;

    onChange([...variants, variantToAdd]);
    resetForm();
  };

  const handleUpdateVariant = () => {
    if (!editingVariant) return;
    
    const updatedVariants = variants.map(v => 
      v.id === editingVariant.id ? { ...v, ...newVariant } : v
    );
    
    onChange(updatedVariants);
    resetForm();
  };

  const handleDeleteVariant = (id: string) => {
    onChange(variants.filter(v => v.id !== id));
  };

  const resetForm = () => {
    setNewVariant({
      name: "",
      price_adjustment: 0,
      stock_quantity: 0,
      sku: ""
    });
    setIsAddingVariant(false);
    setEditingVariant(null);
  };

  const startEdit = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setNewVariant({
      name: variant.name,
      price_adjustment: variant.price_adjustment,
      stock_quantity: variant.stock_quantity,
      sku: variant.sku
    });
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Product Variants</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAddingVariant(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Variant
          </Button>
        </CardHeader>
        <CardContent>
          {variants.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price Adjustment</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((variant) => (
                  <TableRow key={variant.id}>
                    <TableCell>{variant.name}</TableCell>
                    <TableCell>
                      {variant.price_adjustment >= 0 
                        ? `+R${variant.price_adjustment.toFixed(2)}`
                        : `-R${Math.abs(variant.price_adjustment).toFixed(2)}`
                      }
                    </TableCell>
                    <TableCell>{variant.stock_quantity}</TableCell>
                    <TableCell>{variant.sku}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => startEdit(variant)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteVariant(variant.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No variants defined. Add a variant to offer different options for this product.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddingVariant || editingVariant !== null} onOpenChange={(open) => {
        if (!open) resetForm();
        else if (!editingVariant) setIsAddingVariant(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingVariant ? "Edit Variant" : "Add Variant"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="variant-name">Variant Name</Label>
              <Input
                id="variant-name"
                value={newVariant.name || ""}
                onChange={(e) => setNewVariant({...newVariant, name: e.target.value})}
                placeholder="e.g., Large, Blue, etc."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price-adjustment">Price Adjustment (R)</Label>
                <Input
                  id="price-adjustment"
                  type="number"
                  value={newVariant.price_adjustment}
                  onChange={(e) => setNewVariant({...newVariant, price_adjustment: parseFloat(e.target.value)})}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="stock-quantity">Stock Quantity</Label>
                <Input
                  id="stock-quantity"
                  type="number"
                  value={newVariant.stock_quantity}
                  onChange={(e) => setNewVariant({...newVariant, stock_quantity: parseInt(e.target.value)})}
                  placeholder="0"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="sku">SKU (Optional)</Label>
              <Input
                id="sku"
                value={newVariant.sku || ""}
                onChange={(e) => setNewVariant({...newVariant, sku: e.target.value})}
                placeholder="Product SKU"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button 
              onClick={editingVariant ? handleUpdateVariant : handleAddVariant}
            >
              {editingVariant ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductVariantsTable;
