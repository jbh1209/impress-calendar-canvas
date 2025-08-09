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
import { Skeleton } from "@/components/ui/skeleton";
import { formatZAR } from "@/utils/currency";
const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high'>('featured');

  useEffect(() => {
    document.title = "Shop Calendars | Impress";
    // SEO: meta description and canonical tag
    const metaDesc = (document.querySelector('meta[name="description"]') as HTMLMetaElement) || (() => {
      const m = document.createElement('meta');
      m.setAttribute('name', 'description');
      document.head.appendChild(m);
      return m as HTMLMetaElement;
    })();
    metaDesc.setAttribute('content', 'Shop customizable photo calendars. Premium print quality with fast turnaround from Impress.');

    const linkCanonical = (document.querySelector('link[rel="canonical"]') as HTMLLinkElement) || (() => {
      const l = document.createElement('link');
      l.setAttribute('rel', 'canonical');
      document.head.appendChild(l);
      return l as HTMLLinkElement;
    })();
    linkCanonical.setAttribute('href', window.location.origin + '/products');

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

  if (loading) return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-44" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-8 w-24" />
              </div>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl">Shop Calendars</h1>
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
                    <div className="text-lg font-semibold">{formatZAR(p.base_price)}</div>
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
