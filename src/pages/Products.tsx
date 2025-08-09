import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllProducts } from "@/services/productService";
import { Product } from "@/services/types/productTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageWithFallback from "@/components/ImageWithFallback";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high'>('featured');

  useEffect(() => {
    document.title = "Calendars Shop | Impress";
    (async () => {
      const list = await getAllProducts(false, true, false);
      setProducts(list);
      setLoading(false);
    })();
  }, []);

  const productsSorted = [...products].sort((a, b) => {
    if (sortBy === 'price-low') return Number(a.base_price) - Number(b.base_price);
    if (sortBy === 'price-high') return Number(b.base_price) - Number(a.base_price);
    return 0;
  });

  if (loading) return <div className="container mx-auto p-6">Loading products...</div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl">All Products</h1>
            <p className="text-muted-foreground">Showing {productsSorted.length} of {products.length} products</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </header>
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {productsSorted.map((p) => (
            <Card key={p.id} className="group overflow-hidden hover:shadow-lg transition-all">
              <CardContent className="p-0">
                <div className="aspect-square overflow-hidden bg-muted relative">
                  {p.images?.[0]?.image_url ? (
                    <ImageWithFallback
                      src={p.images[0].image_url}
                      alt={p.images[0].alt_text || p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  <h3 className="line-clamp-2">{p.name}</h3>
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold">R {Number(p.base_price).toFixed(2)}</div>
                    <Link to={`/products/${p.id}`}>
                      <Button size="sm">View</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Products;
