import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllProducts } from "@/services/productService";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

interface ProductListItem {
  id: string;
  name: string;
  base_price: number;
  is_active: boolean;
  updated_at: string;
  category?: string | null;
}

export default function ProductsIndex() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [selected, setSelected] = useState<ProductListItem | null>(null);
  const [page, setPage] = useState(1);
  const limit = 20;
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Admin Products | Impress Calendars";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Manage products in a Shopify-like admin with quick details.");
  }, []);

  useEffect(() => {
    (async () => {
      const all = await getAllProducts(false, false, false);
      setProducts(all as any);
    })();
  }, []);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(products.length / limit)), [products.length]);
  const pageItems = useMemo(() => products.slice((page - 1) * limit, page * limit), [products, page]);

  return (
    <main className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Button onClick={() => navigate("/admin/products/new")}>Add product</Button>
      </header>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageItems.map((p) => (
            <TableRow key={p.id} onClick={() => setSelected(p)} className="cursor-pointer">
              <TableCell className="font-medium">{p.name}</TableCell>
              <TableCell>R{p.base_price}</TableCell>
              <TableCell>
                <Badge variant={p.is_active ? "default" : "secondary"}>{p.is_active ? "Active" : "Draft"}</Badge>
              </TableCell>
              <TableCell>{new Date(p.updated_at).toLocaleString()}</TableCell>
            </TableRow>
          ))}
          {pageItems.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">No products found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <footer className="flex items-center justify-end gap-2">
        <span className="text-sm text-muted-foreground">Page {page} / {totalPages}</span>
        <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
        <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
      </footer>

      <Sheet open={!!selected} onOpenChange={(o) => { if (!o) setSelected(null); }}>
        <SheetContent side="right" className="w-[480px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Product Details</SheetTitle>
            <SheetDescription>Quick view of the selected product.</SheetDescription>
          </SheetHeader>
          {selected && (
            <div className="space-y-4 mt-4">
              <div>
                <div className="text-xs text-muted-foreground">Name</div>
                <div className="font-medium">{selected.name}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">Price</div>
                  <div>R{selected.base_price}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Status</div>
                  <Badge variant={selected.is_active ? "default" : "secondary"}>{selected.is_active ? "Active" : "Draft"}</Badge>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Updated</div>
                  <div>{new Date(selected.updated_at).toLocaleString()}</div>
                </div>
                {selected.category && (
                  <div>
                    <div className="text-xs text-muted-foreground">Category</div>
                    <div>{selected.category}</div>
                  </div>
                )}
              </div>
              <Button onClick={() => navigate(`/admin/products/${selected.id}`)}>Edit product</Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </main>
  );
}
