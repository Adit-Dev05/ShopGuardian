import { useState } from "react";
import WalmartHeader from "@/components/walmart-header";
import FakeLogin from "@/components/fake-login";
import WalmartSignup from "@/components/walmart-signup";
import WalmartProducts from "@/components/walmart-products";
import WalmartCart from "@/components/walmart-cart";
import WalmartMyItems from "@/components/walmart-my-items";
import { interactionLogger } from "@/lib/interaction-logger";

export default function DeceptionPage() {
  const [currentView, setCurrentView] = useState<'home' | 'signin' | 'signup' | 'cart' | 'myitems' | 'reorder'>('home');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [cartItems, setCartItems] = useState<string[]>([]);
  
  // Mock product prices for cart total calculation
  const productPrices: Record<string, number> = {
    '1': 1099.00,
    '2': 498.00,
    '3': 89.97,
    '4': 199.99,
    '5': 549.99,
    '6': 279.95
  };

  const cartTotal = cartItems.reduce((sum, id) => sum + (productPrices[id] || 0), 0);

  const handleSignIn = () => {
    setCurrentView('signin');
    interactionLogger.logNavigationClick('button', 'Sign In');
  };

  const handleCreateAccount = () => {
    setCurrentView('signup');
    interactionLogger.logNavigationClick('button', 'Create Account');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    interactionLogger.logNavigationClick('button', 'Back to Home');
  };

  const handleSignInSuccess = () => {
    setIsSignedIn(true);
    setCurrentView('home');
    interactionLogger.logInteraction('successful_signin', { method: 'fake_auth' });
  };

  const handleSignupSuccess = () => {
    setIsSignedIn(true);
    setCurrentView('home');
    interactionLogger.logInteraction('successful_signup', { method: 'fake_auth' });
  };

  const handleAddToCart = (productId: string) => {
    if (!cartItems.includes(productId)) {
      setCartItems(prev => [...prev, productId]);
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(id => id !== productId));
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    // For simplicity, we're not tracking quantities separately
    // In a real app, you'd have a more complex cart state
    if (quantity === 0) {
      handleRemoveFromCart(productId);
    }
  };

  const handleViewCart = () => {
    setCurrentView('cart');
    interactionLogger.logNavigationClick('button', 'View Cart');
  };

  const handleViewMyItems = () => {
    setCurrentView('myitems');
    interactionLogger.logNavigationClick('button', 'View My Items');
  };

  const handleReorder = () => {
    setCurrentView('reorder');
    interactionLogger.logNavigationClick('button', 'Reorder');
    alert('Reorder functionality: View your previous orders and quickly reorder items!');
    setCurrentView('home');
  };

  if (currentView === 'signin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <WalmartHeader 
          onSignIn={handleSignIn}
          onCreateAccount={handleCreateAccount}
          onBackToHome={handleBackToHome}
          onViewCart={handleViewCart}
          onViewMyItems={handleViewMyItems}
          onReorder={handleReorder}
          isSignedIn={isSignedIn}
          cartCount={cartItems.length}
          cartTotal={cartTotal}
        />
        <div className="py-12">
          <FakeLogin />
          <div className="text-center mt-6">
            <button
              onClick={handleBackToHome}
              className="text-walmart-blue hover:underline mr-4"
            >
              ← Back to Shopping
            </button>
            <button
              onClick={handleCreateAccount}
              className="text-walmart-blue hover:underline"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'signup') {
    return (
      <div className="min-h-screen bg-gray-50">
        <WalmartHeader 
          onSignIn={handleSignIn}
          onCreateAccount={handleCreateAccount}
          onBackToHome={handleBackToHome}
          onViewCart={handleViewCart}
          onViewMyItems={handleViewMyItems}
          onReorder={handleReorder}
          isSignedIn={isSignedIn}
          cartCount={cartItems.length}
          cartTotal={cartTotal}
        />
        <div className="py-12">
          <WalmartSignup 
            onBack={handleSignIn}
            onSuccess={handleSignupSuccess}
          />
          <div className="text-center mt-6">
            <button
              onClick={handleBackToHome}
              className="text-walmart-blue hover:underline"
            >
              ← Back to Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'cart') {
    return (
      <div className="min-h-screen bg-gray-50">
        <WalmartHeader 
          onSignIn={handleSignIn}
          onCreateAccount={handleCreateAccount}
          onBackToHome={handleBackToHome}
          onViewCart={handleViewCart}
          onViewMyItems={handleViewMyItems}
          onReorder={handleReorder}
          isSignedIn={isSignedIn}
          cartCount={cartItems.length}
          cartTotal={cartTotal}
        />
        <WalmartCart 
          cartItems={cartItems}
          onBack={handleBackToHome}
          onRemoveItem={handleRemoveFromCart}
          onUpdateQuantity={handleUpdateQuantity}
        />
      </div>
    );
  }

  if (currentView === 'myitems') {
    return (
      <div className="min-h-screen bg-gray-50">
        <WalmartHeader 
          onSignIn={handleSignIn}
          onCreateAccount={handleCreateAccount}
          onBackToHome={handleBackToHome}
          onViewCart={handleViewCart}
          onViewMyItems={handleViewMyItems}
          onReorder={handleReorder}
          isSignedIn={isSignedIn}
          cartCount={cartItems.length}
          cartTotal={cartTotal}
        />
        <WalmartMyItems 
          onBack={handleBackToHome}
          onAddToCart={handleAddToCart}
          cartItems={cartItems}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <WalmartHeader 
        onSignIn={handleSignIn}
        onCreateAccount={handleCreateAccount}
        onBackToHome={handleBackToHome}
        onViewCart={handleViewCart}
        onViewMyItems={handleViewMyItems}
        onReorder={handleReorder}
        isSignedIn={isSignedIn}
        cartCount={cartItems.length}
        cartTotal={cartTotal}
      />
      
      {/* Hero banner */}
      <div className="bg-gradient-to-r from-walmart-blue to-walmart-dark-blue text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Black Friday Deals are Here!</h1>
          <p className="text-xl mb-6">Save big on everything you love</p>
          <button 
            className="bg-walmart-yellow text-black px-8 py-3 rounded-full font-semibold hover:bg-yellow-500 transition-colors"
            onClick={() => interactionLogger.logNavigationClick('button', 'Shop Black Friday')}
          >
            Shop Black Friday
          </button>
        </div>
      </div>

      {/* Special offers banner */}
      <div className="bg-walmart-yellow text-black py-3">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-semibold">
            🎯 Free shipping on orders $35+ • 📱 Download the app for exclusive deals • 💳 Get 5% back with Walmart+ 
          </p>
        </div>
      </div>

      {/* Products section */}
      <WalmartProducts onAddToCart={handleAddToCart} cartItems={cartItems} />

      {/* Footer */}
      <footer className="bg-walmart-blue text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">All Departments</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:underline" onClick={(e) => { e.preventDefault(); interactionLogger.logNavigationClick('footer', 'Auto & Tires'); }}>Auto & Tires</a></li>
                <li><a href="#" className="hover:underline" onClick={(e) => { e.preventDefault(); interactionLogger.logNavigationClick('footer', 'Baby'); }}>Baby</a></li>
                <li><a href="#" className="hover:underline" onClick={(e) => { e.preventDefault(); interactionLogger.logNavigationClick('footer', 'Beauty'); }}>Beauty</a></li>
                <li><a href="#" className="hover:underline" onClick={(e) => { e.preventDefault(); interactionLogger.logNavigationClick('footer', 'Books'); }}>Books</a></li>
                <li><a href="#" className="hover:underline" onClick={(e) => { e.preventDefault(); interactionLogger.logNavigationClick('footer', 'Cell Phones'); }}>Cell Phones</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Customer Service</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:underline" onClick={(e) => { e.preventDefault(); interactionLogger.logNavigationClick('footer', 'Help Center'); }}>Help Center</a></li>
                <li><a href="#" className="hover:underline" onClick={(e) => { e.preventDefault(); interactionLogger.logNavigationClick('footer', 'Track Your Order'); }}>Track Your Order</a></li>
                <li><a href="#" className="hover:underline" onClick={(e) => { e.preventDefault(); interactionLogger.logNavigationClick('footer', 'Shipping Info'); }}>Shipping Info</a></li>
                <li><a href="#" className="hover:underline" onClick={(e) => { e.preventDefault(); interactionLogger.logNavigationClick('footer', 'Returns'); }}>Returns</a></li>
                <li><a href="#" className="hover:underline" onClick={(e) => { e.preventDefault(); interactionLogger.logNavigationClick('footer', 'Contact Us'); }}>Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Get to Know Us</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:underline" onClick={(e) => { e.preventDefault(); interactionLogger.logNavigationClick('footer', 'Careers'); }}>Careers</a></li>
                <li><a href="#" className="hover:underline" onClick={(e) => { e.preventDefault(); interactionLogger.logNavigationClick('footer', 'Our Company'); }}>Our Company</a></li>
                <li><a href="#" className="hover:underline" onClick={(e) => { e.preventDefault(); interactionLogger.logNavigationClick('footer', 'Sell on Walmart'); }}>Sell on Walmart.com</a></li>
                <li><a href="#" className="hover:underline" onClick={(e) => { e.preventDefault(); interactionLogger.logNavigationClick('footer', 'Suppliers'); }}>Suppliers</a></li>
                <li><a href="#" className="hover:underline" onClick={(e) => { e.preventDefault(); interactionLogger.logNavigationClick('footer', 'Accessibility'); }}>Accessibility</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Walmart Apps</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:underline" onClick={(e) => { e.preventDefault(); interactionLogger.logNavigationClick('footer', 'Walmart App'); }}>Walmart App</a></li>
                <li><a href="#" className="hover:underline" onClick={(e) => { e.preventDefault(); interactionLogger.logNavigationClick('footer', 'Grocery App'); }}>Grocery App</a></li>
                <li><a href="#" className="hover:underline" onClick={(e) => { e.preventDefault(); interactionLogger.logNavigationClick('footer', 'Our Company App'); }}>Our Company App</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-blue-600 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 Walmart Inc. All Rights Reserved.</p>
            <div className="flex justify-center space-x-6 mt-4">
              <a href="#" className="hover:underline" onClick={(e) => { e.preventDefault(); interactionLogger.logNavigationClick('footer', 'Privacy Policy'); }}>Privacy Policy</a>
              <a href="#" className="hover:underline" onClick={(e) => { e.preventDefault(); interactionLogger.logNavigationClick('footer', 'Terms of Use'); }}>Terms of Use</a>
              <a href="#" className="hover:underline" onClick={(e) => { e.preventDefault(); interactionLogger.logNavigationClick('footer', 'Do Not Sell My Info'); }}>Do Not Sell My Personal Information</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
