import { useState } from "react";
import { Minus, Plus, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { interactionLogger } from "@/lib/interaction-logger";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  inStock: boolean;
}

interface WalmartCartProps {
  cartItems: string[];
  onBack: () => void;
  onRemoveItem: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}

const mockCartItems: Record<string, CartItem> = {
  '1': {
    id: '1',
    name: 'iPhone 14 Pro Max, 128GB, Deep Purple',
    price: 1099.00,
    quantity: 1,
    image: 'https://picsum.photos/300/200?random=1',
    inStock: true
  },
  '2': {
    id: '2',
    name: 'Samsung 65" Class 4K UHD LED LCD TV',
    price: 498.00,
    quantity: 1,
    image: 'https://picsum.photos/300/200?random=2',
    inStock: true
  },
  '3': {
    id: '3',
    name: 'Nike Air Max 270 Men\'s Running Shoes',
    price: 89.97,
    quantity: 2,
    image: 'https://picsum.photos/300/200?random=3',
    inStock: true
  },
  '4': {
    id: '4',
    name: 'KitchenAid Stand Mixer, 5-Qt, Empire Red',
    price: 199.99,
    quantity: 1,
    image: 'https://picsum.photos/300/200?random=4',
    inStock: true
  }
};

export default function WalmartCart({ cartItems, onBack, onRemoveItem, onUpdateQuantity }: WalmartCartProps) {
  const [promoCode, setPromoCode] = useState("");

  const items = cartItems.map(id => ({
    ...mockCartItems[id],
    quantity: mockCartItems[id]?.quantity || 1
  })).filter(Boolean);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.0875; // 8.75% tax
  const shipping = subtotal > 35 ? 0 : 5.99;
  const total = subtotal + tax + shipping;

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      onRemoveItem(itemId);
      interactionLogger.logInteraction('remove_from_cart', { productId: itemId });
    } else {
      onUpdateQuantity(itemId, newQuantity);
      interactionLogger.logInteraction('update_quantity', { productId: itemId, quantity: newQuantity });
    }
  };

  const handleRemoveItem = (itemId: string) => {
    onRemoveItem(itemId);
    interactionLogger.logInteraction('remove_from_cart', { productId: itemId });
  };

  const handleCheckout = () => {
    interactionLogger.logInteraction('checkout_attempt', { 
      itemCount: items.length,
      total: total,
      subtotal: subtotal,
      tax: tax,
      shipping: shipping
    });
    alert('Redirecting to secure checkout...');
  };

  const handleApplyPromo = () => {
    if (promoCode.trim()) {
      interactionLogger.logInteraction('promo_code_attempt', { code: promoCode });
      alert(`Promo code "${promoCode}" applied! You saved $5.00`);
      setPromoCode("");
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Button
            onClick={onBack}
            className="mb-6 flex items-center space-x-2 text-walmart-blue hover:text-walmart-dark-blue"
            variant="ghost"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Continue Shopping</span>
          </Button>
          
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
            <Button
              onClick={onBack}
              className="walmart-blue hover:walmart-dark-blue text-white px-8 py-3"
            >
              Start Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Button
          onClick={onBack}
          className="mb-6 flex items-center space-x-2 text-walmart-blue hover:text-walmart-dark-blue"
          variant="ghost"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Continue Shopping</span>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex items-start space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`
                            <svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
                              <rect width="100%" height="100%" fill="#f3f4f6"/>
                              <text x="50%" y="50%" font-family="Arial" font-size="10" fill="#9ca3af" text-anchor="middle" dy=".3em">
                                Product
                              </text>
                            </svg>
                          `)}`;
                        }}
                      />
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.inStock ? 'In stock' : 'Out of stock'}
                        </p>
                        <p className="text-lg font-bold text-gray-900 mt-2">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {/* Quantity controls */}
                        <div className="flex items-center border border-gray-300 rounded">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        {/* Remove button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal ({items.length} items)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Promo code */}
              <div className="mt-6">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    onFocus={() => interactionLogger.logFormFocus('promo_code')}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={handleApplyPromo}
                    className="px-4"
                  >
                    Apply
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                className="w-full mt-6 walmart-blue hover:walmart-dark-blue text-white py-3 font-semibold"
              >
                Continue to Checkout
              </Button>

              <div className="mt-4 text-xs text-gray-500 text-center">
                <p>Free shipping on orders $35+</p>
                <p>Free returns within 90 days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}