import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Star, ArrowRight, Truck, Shield, RefreshCw, Headphones } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Product } from '../App';

interface LandingPageProps {
  onNavigateToProducts: () => void;
  onNavigateToProduct: (product: Product) => void;
}

const featuredProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    price: 199,
    originalPrice: 249,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop'],
    description: 'High-quality wireless headphones with noise cancellation',
    category: 'Electronics',
    rating: 4.8,
    reviews: 245,
    inStock: true,
    colors: ['Black', 'White', 'Blue'],
  },
  {
    id: '2',
    name: 'Organic Cotton T-Shirt',
    price: 29,
    originalPrice: 39,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop'],
    description: 'Soft and comfortable organic cotton t-shirt',
    category: 'Clothing',
    rating: 4.6,
    reviews: 128,
    inStock: true,
    colors: ['White', 'Navy', 'Gray'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
  },
  {
    id: '3',
    name: 'Leather Crossbody Bag',
    price: 89,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop'],
    description: 'Handcrafted leather crossbody bag for everyday use',
    category: 'Accessories',
    rating: 4.9,
    reviews: 87,
    inStock: true,
    colors: ['Brown', 'Black', 'Tan'],
  },
  {
    id: '4',
    name: 'Smart Fitness Watch',
    price: 299,
    originalPrice: 349,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop'],
    description: 'Advanced fitness tracking with heart rate monitoring',
    category: 'Electronics',
    rating: 4.7,
    reviews: 412,
    inStock: true,
    colors: ['Black', 'Silver', 'Rose Gold'],
  },
];

export function LandingPage({ onNavigateToProducts, onNavigateToProduct }: LandingPageProps) {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-50 to-gray-100 py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl tracking-tight">
                  Discover Your Style
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  Shop the latest trends in fashion, electronics, and lifestyle products. 
                  Quality guaranteed with free shipping on orders over $50.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={onNavigateToProducts} className="text-lg px-8">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8">
                  View Lookbook
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl">50K+</div>
                  <div className="text-sm text-muted-foreground">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl">1M+</div>
                  <div className="text-sm text-muted-foreground">Products Sold</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl">4.9</div>
                  <div className="text-sm text-muted-foreground">Average Rating</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=800&fit=crop"
                  alt="Hero Product"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center space-x-2 text-sm">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>Trending Product</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <h3>Free Shipping</h3>
              <p className="text-sm text-muted-foreground">
                Free delivery on orders over $50
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3>Secure Payment</h3>
              <p className="text-sm text-muted-foreground">
                100% secure and encrypted payments
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <RefreshCw className="h-6 w-6 text-primary" />
              </div>
              <h3>Easy Returns</h3>
              <p className="text-sm text-muted-foreground">
                30-day hassle-free returns
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Headphones className="h-6 w-6 text-primary" />
              </div>
              <h3>24/7 Support</h3>
              <p className="text-sm text-muted-foreground">
                Round-the-clock customer service
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl lg:text-4xl">Featured Products</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover our handpicked selection of premium products, 
              carefully chosen for quality, style, and value.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Card 
                key={product.id} 
                className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300"
                onClick={() => onNavigateToProduct(product)}
              >
                <div className="aspect-square overflow-hidden">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.originalPrice && (
                    <Badge className="absolute top-3 left-3 bg-destructive">
                      Save ${product.originalPrice - product.price}
                    </Badge>
                  )}
                </div>
                
                <div className="p-4 space-y-3">
                  <div className="space-y-1">
                    <h3 className="line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{product.rating}</span>
                      <span className="text-sm text-muted-foreground">({product.reviews})</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">${product.price}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" onClick={onNavigateToProducts}>
              View All Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl lg:text-4xl">Stay in the Loop</h2>
            <p className="text-primary-foreground/80">
              Get the latest updates on new products, exclusive offers, and style tips.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-foreground"
              />
              <Button variant="secondary" size="lg">
                Subscribe
              </Button>
            </div>
            
            <p className="text-sm text-primary-foreground/60">
              Unsubscribe at any time. No spam, we promise.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}