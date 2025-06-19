import { useState } from "react";
import { Star, Heart, ShoppingCart, Truck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { interactionLogger } from "@/lib/interaction-logger";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
  inStock: boolean;
  freeShipping: boolean;
  pickupToday: boolean;
  brand?: string;
  badges?: string[];
}

const featuredProducts: Product[] = [
  {
    id: '1',
    name: 'iPhone 14 Pro Max, 128GB, Deep Purple',
    price: 1099.00,
    originalPrice: 1199.00,
    rating: 4.5,
    reviewCount: 2847,
    image: '/placeholder-phone.jpg',
    category: 'Electronics',
    inStock: true,
    freeShipping: true,
    pickupToday: true,
    brand: 'Apple',
    badges: ['Rollback', 'Best Seller']
  },
  {
    id: '2',
    name: 'Samsung 65" Class 4K UHD LED LCD TV',
    price: 498.00,
    originalPrice: 699.00,
    rating: 4.3,
    reviewCount: 1205,
    image: '/placeholder-tv.jpg',
    category: 'Electronics',
    inStock: true,
    freeShipping: true,
    pickupToday: false,
    brand: 'Samsung',
    badges: ['Black Friday Deal']
  },
  {
    id: '3',
    name: 'Nike Air Max 270 Men\'s Running Shoes',
    price: 89.97,
    originalPrice: 150.00,
    rating: 4.7,
    reviewCount: 892,
    image: '/placeholder-shoes.jpg',
    category: 'Footwear',
    inStock: true,
    freeShipping: true,
    pickupToday: true,
    brand: 'Nike',
    badges: ['Clearance']
  },
  {
    id: '4',
    name: 'KitchenAid Stand Mixer, 5-Qt, Empire Red',
    price: 199.99,
    originalPrice: 379.99,
    rating: 4.8,
    reviewCount: 3421,
    image: '/placeholder-mixer.jpg',
    category: 'Home & Kitchen',
    inStock: true,
    freeShipping: true,
    pickupToday: true,
    brand: 'KitchenAid',
    badges: ['Rollback', 'Top Rated']
  },
  {
    id: '5',
    name: 'Dyson V15 Detect Cordless Vacuum',
    price: 549.99,
    originalPrice: 749.99,
    rating: 4.6,
    reviewCount: 756,
    image: '/placeholder-vacuum.jpg',
    category: 'Home & Kitchen',
    inStock: false,
    freeShipping: true,
    pickupToday: false,
    brand: 'Dyson',
    badges: ['Limited Time']
  },
  {
    id: '6',
    name: 'LEGO Creator Expert Taj Mahal (10256)',
    price: 279.95,
    originalPrice: 369.99,
    rating: 4.9,
    reviewCount: 234,
    image: '/placeholder-lego.jpg',
    category: 'Toys',
    inStock: true,
    freeShipping: true,
    pickupToday: false,
    brand: 'LEGO',
    badges: ['Exclusive']
  }
];

interface WalmartProductsProps {
  onAddToCart: (productId: string) => void;
  cartItems: string[];
}

export default function WalmartProducts({ onAddToCart, cartItems }: WalmartProductsProps) {
  const [favorites, setFavorites] = useState<string[]>([]);

  const handleProductClick = (product: Product) => {
    interactionLogger.logProductView(product.name);
    interactionLogger.logInteraction('product_detail_view', {
      productId: product.id,
      productName: product.name,
      price: product.price,
      category: product.category,
      brand: product.brand
    });
  };

  const handleAddToCart = (product: Product) => {
    onAddToCart(product.id);
    interactionLogger.logInteraction('add_to_cart', {
      productId: product.id,
      productName: product.name,
      price: product.price
    });
  };

  const handleAddToFavorites = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
    interactionLogger.logInteraction('add_to_favorites', { productId });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400" style={{ clipPath: 'inset(0 50% 0 0)' }} />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }
    
    return stars;
  };

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <Button 
            variant="outline"
            onClick={() => interactionLogger.logNavigationClick('button', 'View all products')}
          >
            View all
          </Button>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <div 
              key={product.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleProductClick(product)}
            >
              {/* Product image */}
              <div className="relative">
                <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Product Image</span>
                </div>
                
                {/* Badges */}
                {product.badges && (
                  <div className="absolute top-2 left-2 flex flex-col space-y-1">
                    {product.badges.map((badge) => (
                      <Badge 
                        key={badge}
                        className={`text-xs ${
                          badge === 'Rollback' ? 'bg-walmart-yellow text-black' :
                          badge === 'Best Seller' ? 'bg-orange-500 text-white' :
                          badge === 'Black Friday Deal' ? 'bg-black text-white' :
                          badge === 'Clearance' ? 'bg-red-500 text-white' :
                          badge === 'Top Rated' ? 'bg-green-500 text-white' :
                          'bg-blue-500 text-white'
                        }`}
                      >
                        {badge}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Favorite button */}
                <button
                  className="absolute top-2 right-2 p-2 rounded-full bg-white shadow hover:shadow-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToFavorites(product.id);
                  }}
                >
                  <Heart 
                    className={`h-4 w-4 ${
                      favorites.includes(product.id) 
                        ? 'fill-red-500 text-red-500' 
                        : 'text-gray-400'
                    }`} 
                  />
                </button>
              </div>

              {/* Product details */}
              <div className="p-4">
                {/* Brand */}
                {product.brand && (
                  <p className="text-sm text-gray-600 mb-1">{product.brand}</p>
                )}

                {/* Product name */}
                <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center space-x-1 mb-2">
                  <div className="flex">
                    {renderStars(product.rating)}
                  </div>
                  <span className="text-sm text-gray-600">
                    ({product.reviewCount})
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-lg font-bold text-gray-900">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Shipping info */}
                <div className="flex items-center space-x-4 text-xs text-gray-600 mb-3">
                  {product.freeShipping && (
                    <div className="flex items-center space-x-1">
                      <Truck className="h-3 w-3" />
                      <span>Free shipping</span>
                    </div>
                  )}
                  {product.pickupToday && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>Pickup today</span>
                    </div>
                  )}
                </div>

                {/* Stock status */}
                <div className="mb-3">
                  {product.inStock ? (
                    <span className="text-sm text-green-600 font-medium">In stock</span>
                  ) : (
                    <span className="text-sm text-red-600 font-medium">Out of stock</span>
                  )}
                </div>

                {/* Add to cart button */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (product.inStock) {
                      handleAddToCart(product);
                    }
                  }}
                  disabled={!product.inStock}
                  className={`w-full ${
                    cartItems.includes(product.id)
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'walmart-blue hover:walmart-dark-blue'
                  } text-white`}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {cartItems.includes(product.id) 
                    ? 'Added to cart' 
                    : product.inStock 
                    ? 'Add to cart' 
                    : 'Out of stock'
                  }
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Categories section */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Shop by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              'Electronics', 'Home', 'Clothing', 'Beauty', 'Pharmacy', 'Auto',
              'Baby', 'Sports', 'Toys', 'Grocery', 'Books', 'Music'
            ].map((category) => (
              <button
                key={category}
                className="bg-white rounded-lg p-4 text-center shadow hover:shadow-md transition-shadow"
                onClick={() => interactionLogger.logNavigationClick('category', category)}
              >
                <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-2"></div>
                <span className="text-sm font-medium text-gray-900">{category}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}