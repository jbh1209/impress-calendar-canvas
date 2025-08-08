import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllProducts } from "@/services/productService";
import { Product } from "@/services/types/productTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Calendars Shop | Impress";
    (async () => {
      const list = await getAllProducts(false, true, false);
      setProducts(list);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="container mx-auto p-6">Loading products...</div>;

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Products</h1>
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <Card key={p.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">{p.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-[4/3] bg-gray-100 rounded mb-3 overflow-hidden">
                {p.images?.[0]?.image_url ? (
                  <img src={p.images[0].image_url} alt={p.images[0].alt_text || p.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="font-semibold">R {Number(p.base_price).toFixed(2)}</div>
                <Link to={`/products/${p.id}`}>
                  <Button size="sm">View</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
};

export default Products;
