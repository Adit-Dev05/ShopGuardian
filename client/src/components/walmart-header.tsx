import { useState } from "react";
import { Search, ShoppingCart, User, Menu, MapPin, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { interactionLogger } from "@/lib/interaction-logger";

interface WalmartHeaderProps {
  onSignIn: () => void;
  onCreateAccount: () => void;
  onBackToHome: () => void;
  onViewCart: () => void;
  onViewMyItems: () => void;
  onReorder: () => void;
  isSignedIn: boolean;
  cartCount: number;
  cartTotal: number;
}

export default function WalmartHeader({ 
  onSignIn, 
  onCreateAccount, 
  onBackToHome, 
  onViewCart, 
  onViewMyItems, 
  onReorder, 
  isSignedIn, 
  cartCount, 
  cartTotal 
}: WalmartHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDepartmentsOpen, setIsDepartmentsOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      interactionLogger.logInteraction('search_query', { query: searchQuery });
      // Simulate search results
      alert(`Searching for "${searchQuery}"... Found 247 results!`);
      setSearchQuery("");
    }
  };

  const handleNavClick = (item: string, href?: string) => {
    interactionLogger.logNavigationClick('nav', item, href);
  };

  const departments = [
    "Electronics", "Home", "Clothing", "Grocery", "Pharmacy", "Auto & Tires",
    "Baby", "Beauty", "Health", "Sports & Outdoors", "Toys", "Video Games",
    "Movies & TV", "Books", "Music", "Gift Cards", "Crafts", "Party Supplies"
  ];

  const services = [
    "Auto Care Centers", "Pharmacy", "Vision Center", "Photo Services",
    "Money Services", "Grocery Pickup", "Delivery", "Installation Services",
    "Tech Services", "Pet Services", "Travel", "Walmart+", "Gift Registry"
  ];

  return (
    <header className="bg-white border-b border-gray-200">
      {/* Top banner */}
      <div className="bg-walmart-blue text-white text-sm py-1">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span>Free shipping, arrives in 3+ days</span>
          <div className="flex items-center space-x-4">
            <span>How do you want your items?</span>
            <div className="flex items-center space-x-1">
              <MapPin className="h-3 w-3" />
              <span>Sacramento, 95829</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <button 
              className="md:hidden p-2"
              onClick={() => handleNavClick('Menu toggle')}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div 
              className="walmart-blue text-white px-3 py-2 rounded cursor-pointer"
              onClick={() => {
                handleNavClick('Walmart logo', '/');
                onBackToHome();
              }}
            >
              <span className="text-xl font-bold">Walmart</span>
            </div>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search everything at Walmart online and in store"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => interactionLogger.logFormFocus('search')}
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-full"
              />
              <Button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-4 bg-walmart-yellow hover:bg-yellow-500 text-black rounded-full"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </form>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              className="flex items-center space-x-1"
              onClick={() => {
                handleNavClick('Reorder');
                onReorder();
              }}
            >
              <div className="flex flex-col items-center">
                <div className="grid grid-cols-2 gap-1 w-4 h-4">
                  <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                </div>
                <span className="text-xs">Reorder</span>
              </div>
            </Button>

            <Button
              variant="ghost"
              className="flex items-center space-x-1"
              onClick={() => {
                handleNavClick('My Items');
                onViewMyItems();
              }}
            >
              <div className="flex flex-col items-center">
                <Heart className="h-5 w-5" />
                <span className="text-xs">My Items</span>
              </div>
            </Button>

            <Button
              variant="ghost"
              className="flex items-center space-x-1"
              onClick={isSignedIn ? () => handleNavClick('Account') : onSignIn}
            >
              <div className="flex flex-col items-center">
                <User className="h-5 w-5" />
                <span className="text-xs">{isSignedIn ? 'Account' : 'Sign In'}</span>
              </div>
            </Button>

            <Button
              variant="ghost"
              className="flex items-center space-x-1 relative"
              onClick={() => {
                handleNavClick('Shopping cart');
                onViewCart();
              }}
            >
              <div className="flex flex-col items-center">
                <div className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-walmart-yellow text-black text-xs flex items-center justify-center">
                      {cartCount}
                    </Badge>
                  )}
                </div>
                <span className="text-xs">${cartTotal.toFixed(2)}</span>
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation menu */}
      <div className="bg-walmart-blue">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center space-x-8 py-2">
            <div className="relative">
              <Button
                variant="ghost"
                className="text-black hover:bg-walmart-yellow hover:text-black flex items-center space-x-1"
                onClick={() => {
                  setIsDepartmentsOpen(!isDepartmentsOpen);
                  handleNavClick('Departments');
                }}
              >
                <Menu className="h-4 w-4" />
                <span>Departments</span>
              </Button>
              
              {isDepartmentsOpen && (
                <div className="absolute top-full left-0 bg-white text-black shadow-lg rounded-b-lg w-64 z-50">
                  <div className="grid grid-cols-2 gap-1 p-4">
                    {departments.map((dept) => (
                      <button
                        key={dept}
                        className="text-left text-sm hover:text-walmart-blue py-1"
                        onClick={() => {
                          handleNavClick('Department', dept);
                          setIsDepartmentsOpen(false);
                        }}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <Button
                variant="ghost"
                className="text-black hover:bg-walmart-yellow hover:text-black"
                onClick={() => {
                  setIsServicesOpen(!isServicesOpen);
                  handleNavClick('Services');
                }}
              >
                Services
              </Button>
              
              {isServicesOpen && (
                <div className="absolute top-full left-0 bg-white text-black shadow-lg rounded-b-lg w-64 z-50">
                  <div className="p-4 space-y-2">
                    {services.map((service) => (
                      <button
                        key={service}
                        className="block text-left text-sm hover:text-walmart-blue py-1 w-full"
                        onClick={() => {
                          handleNavClick('Service', service);
                          setIsServicesOpen(false);
                        }}
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              className="text-black hover:bg-walmart-yellow hover:text-black"
              onClick={() => handleNavClick('Grocery', '/grocery')}
            >
              Grocery & Essentials
            </Button>

            <Button
              variant="ghost"
              className="text-black hover:bg-walmart-yellow hover:text-black"
              onClick={() => handleNavClick('Walmart+', '/plus')}
            >
              Walmart+
            </Button>

            <Button
              variant="ghost"
              className="text-black hover:bg-walmart-yellow hover:text-black"
              onClick={() => handleNavClick('Black Friday', '/black-friday')}
            >
              Black Friday Deals
            </Button>

            <Button
              variant="ghost"
              className="text-black hover:bg-walmart-yellow hover:text-black"
              onClick={() => handleNavClick('Fashion', '/fashion')}
            >
              Fashion
            </Button>

            <Button
              variant="ghost"
              className="text-black hover:bg-walmart-yellow hover:text-black"
              onClick={() => handleNavClick('Registry', '/registry')}
            >
              Registry
            </Button>

            <Button
              variant="ghost"
              className="text-black hover:bg-walmart-yellow hover:text-black"
              onClick={() => handleNavClick('One Debit', '/debit')}
            >
              ONE Debit
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}