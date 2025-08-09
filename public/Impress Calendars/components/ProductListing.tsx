import { useState } from 'react';
import { Filter, Grid3X3, List, SlidersHorizontal, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Product } from '../App';

interface ProductListingProps {
  onNavigateToProduct: (product: Product) => void;
}

const allProducts: Product[] = [
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
  {
    id: '5',
    name: 'Minimalist Desk Lamp',
    price: 79,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop',
    images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop'],
    description: 'Modern LED desk lamp with adjustable brightness',
    category: 'Home & Living',
    rating: 4.5,
    reviews: 156,
    inStock: true,
    colors: ['White', 'Black'],
  },
  {
    id: '6',
    name: 'Running Sneakers',
    price: 129,
    originalPrice: 159,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop'],
    description: 'Lightweight running shoes with superior comfort',
    category: 'Footwear',
    rating: 4.4,
    reviews: 203,
    inStock: true,
    colors: ['White', 'Black', 'Blue'],
    sizes: ['7', '8', '9', '10', '11', '12'],
  },
];

const categories = ['All', 'Electronics', 'Clothing', 'Accessories', 'Home & Living', 'Footwear'];

export function ProductListing({ onNavigateToProduct }: ProductListingProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredProducts = allProducts.filter(product => {
    const categoryMatch = selectedCategory === 'All' || product.category === selectedCategory;
    const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];
    return categoryMatch && priceMatch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return 0; // Would use actual date in real app
      default:
        return 0;
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl mb-2">All Products</h1>
          <p className="text-muted-foreground">
            Showing {sortedProducts.length} of {allProducts.length} products
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className={`lg:block ${showFilters ? 'block' : 'hidden'} space-y-6`}>
          <Card className="p-6">
            <h3 className="mb-4 flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </h3>

            {/* Categories */}
            <div className="space-y-4">
              <h4>Category</h4>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={selectedCategory === category}
                      onCheckedChange={() => setSelectedCategory(category)}
                    />
                    <label htmlFor={category} className="text-sm cursor-pointer">
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-4 pt-6 border-t">
              <h4>Price Range</h4>
              <div className="px-2">
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={500}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
            </div>

            {/* In Stock */}
            <div className="space-y-4 pt-6 border-t">
              <div className="flex items-center space-x-2">
                <Checkbox id="in-stock" defaultChecked />
                <label htmlFor="in-stock" className="text-sm cursor-pointer">
                  In Stock Only
                </label>
              </div>
            </div>
          </Card>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {viewMode === 'grid' ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
                <Card 
                  key={product.id} 
                  className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300"
                  onClick={() => onNavigateToProduct(product)}
                >
                  <div className="aspect-square overflow-hidden relative">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.originalPrice && (
                      <Badge className="absolute top-3 left-3 bg-destructive">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                      </Badge>
                    )}
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="secondary">Out of Stock</Badge>
                      </div>
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
          ) : (
            <div className="space-y-4">
              {sortedProducts.map((product) => (
                <Card 
                  key={product.id} 
                  className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300"
                  onClick={() => onNavigateToProduct(product)}
                >
                  <div className="flex gap-6 p-6">
                    <div className="w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg">
                      <ImageWithFallback
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="text-lg group-hover:text-primary transition-colors">
                            {product.name}
                          </h3>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{product.rating}</span>
                            <span className="text-sm text-muted-foreground">({product.reviews})</span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className="text-xl">${product.price}</span>
                            {product.originalPrice && (
                              <span className="text-sm text-muted-foreground line-through">
                                ${product.originalPrice}
                              </span>
                            )}
                          </div>
                          {product.originalPrice && (
                            <Badge className="mt-1 bg-destructive">
                              Save ${product.originalPrice - product.price}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{product.category}</Badge>
                        {!product.inStock && (
                          <Badge variant="destructive">Out of Stock</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {sortedProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found matching your criteria.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSelectedCategory('All');
                  setPriceRange([0, 500]);
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}