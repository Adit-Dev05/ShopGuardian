import { useState } from "react";
import { ArrowLeft, Heart, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { interactionLogger } from "@/lib/interaction-logger";

interface SavedItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  inStock: boolean;
  dateAdded: Date;
}

interface WalmartMyItemsProps {
  onBack: () => void;
  onAddToCart: (productId: string) => void;
  cartItems: string[];
}

const mockSavedItems: SavedItem[] = [
  {
    id: '1',
    name: 'iPhone 14 Pro Max, 128GB, Deep Purple',
    price: 1099.00,
    originalPrice: 1199.00,
    rating: 4.5,
    reviewCount: 2847,
    image: 'https://picsum.photos/300/200?random=1',
    inStock: true,
    dateAdded: new Date('2024-06-15')
  },
  {
    id: '5',
    name: 'Dyson V15 Detect Cordless Vacuum',
    price: 549.99,
    originalPrice: 749.99,
    rating: 4.6,
    reviewCount: 756,
    image: 'https://picsum.photos/300/200?random=5',
    inStock: false,
    dateAdded: new Date('2024-06-10')
  },
  {
    id: '7',
    name: 'Apple Watch Series 9 GPS, 45mm',
    price: 399.00,
    originalPrice: 429.00,
    rating: 4.8,
    reviewCount: 1823,
    image: 'https://picsum.photos/300/200?random=7',
    inStock: true,
    dateAdded: new Date('2024-06-05')
  }
];

export default function WalmartMyItems({ onBack, onAddToCart, cartItems }: WalmartMyItemsProps) {
  const [savedItems, setSavedItems] = useState<SavedItem[]>(mockSavedItems);
  const [filter, setFilter] = useState<'all' | 'available' | 'unavailable'>('all');

  const handleRemoveFromSaved = (itemId: string) => {
    setSavedItems(prev => prev.filter(item => item.id !== itemId));
    interactionLogger.logInteraction('remove_from_saved', { productId: itemId });
  };

  const handleAddToCart = (item: SavedItem) => {
    if (item.inStock) {
      onAddToCart(item.id);
      interactionLogger.logInteraction('add_to_cart_from_saved', {
        productId: item.id,
        productName: item.name,
        price: item.price
      });
    }
  };

  const filteredItems = savedItems.filter(item => {
    if (filter === 'available') return item.inStock;
    if (filter === 'unavailable') return !item.inStock;
    return true;
  });

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    
    const emptyStars = 5 - fullStars;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }
    
    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Button
          onClick={onBack}
          className="mb-6 flex items-center space-x-2 text-walmart-blue hover:text-walmart-dark-blue"
          variant="ghost"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Shopping</span>
        </Button>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Heart className="h-6 w-6 mr-2 text-red-500" />
                  My Items
                </h2>
                <p className="text-gray-600 mt-1">
                  {savedItems.length} saved items
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setFilter('all');
                    interactionLogger.logNavigationClick('filter', 'All Items');
                  }}
                  className={filter === 'all' ? 'walmart-blue' : ''}
                >
                  All ({savedItems.length})
                </Button>
                <Button
                  variant={filter === 'available' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setFilter('available');
                    interactionLogger.logNavigationClick('filter', 'Available');
                  }}
                  className={filter === 'available' ? 'walmart-blue' : ''}
                >
                  Available ({savedItems.filter(item => item.inStock).length})
                </Button>
                <Button
                  variant={filter === 'unavailable' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setFilter('unavailable');
                    interactionLogger.logNavigationClick('filter', 'Unavailable');
                  }}
                  className={filter === 'unavailable' ? 'walmart-blue' : ''}
                >
                  Unavailable ({savedItems.filter(item => !item.inStock).length})
                </Button>
              </div>
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="p-12 text-center">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'all' ? 'No saved items yet' : `No ${filter} items`}
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? 'Save items you love by clicking the heart icon'
                  : `You don't have any ${filter} saved items`
                }
              </p>
              <Button
                onClick={onBack}
                className="walmart-blue hover:walmart-dark-blue text-white"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`
                          <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
                            <rect width="100%" height="100%" fill="#f3f4f6"/>
                            <text x="50%" y="50%" font-family="Arial" font-size="14" fill="#9ca3af" text-anchor="middle" dy=".3em">
                              Product Image
                            </text>
                          </svg>
                        `)}`;
                      }}
                    />
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 bg-white shadow hover:bg-gray-50 h-8 w-8 p-0"
                      onClick={() => handleRemoveFromSaved(item.id)}
                    >
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    </Button>

                    {!item.inStock && (
                      <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                        Out of Stock
                      </Badge>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {item.name}
                    </h3>

                    <div className="flex items-center space-x-1 mb-2">
                      <div className="flex">
                        {renderStars(item.rating)}
                      </div>
                      <span className="text-sm text-gray-600">
                        ({item.reviewCount})
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-lg font-bold text-gray-900">
                        ${item.price.toFixed(2)}
                      </span>
                      {item.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ${item.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 mb-3">
                      Added {item.dateAdded.toLocaleDateString()}
                    </p>

                    <Button
                      onClick={() => handleAddToCart(item)}
                      disabled={!item.inStock}
                      className={`w-full ${
                        cartItems.includes(item.id)
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'walmart-blue hover:walmart-dark-blue'
                      } text-white`}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {cartItems.includes(item.id)
                        ? 'In Cart'
                        : item.inStock
                        ? 'Add to Cart'
                        : 'Out of Stock'
                      }
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}