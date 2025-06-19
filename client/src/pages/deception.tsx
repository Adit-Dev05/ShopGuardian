import { interactionLogger } from "@/lib/interaction-logger";
import FakeLogin from "@/components/fake-login";
import FakeDashboard from "@/components/fake-dashboard";

export default function DeceptionPage() {
  const handleLinkClick = (text: string, href?: string) => {
    interactionLogger.logNavigationClick('a', text, href);
  };

  return (
    <div className="space-y-6">
      {/* Fake Walmart Header */}
      <div className="walmart-blue text-white">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="text-2xl font-bold">Walmart</div>
              <div className="hidden md:flex space-x-6 text-sm">
                <a 
                  href="#" 
                  className="hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick('Departments', '#');
                  }}
                >
                  Departments
                </a>
                <a 
                  href="#" 
                  className="hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick('Services', '#');
                  }}
                >
                  Services
                </a>
                <a 
                  href="#" 
                  className="hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick('Grocery', '#');
                  }}
                >
                  Grocery
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                className="text-sm hover:underline"
                onClick={() => handleLinkClick('Sign In', undefined)}
              >
                Sign In
              </button>
              <button 
                className="text-sm hover:underline"
                onClick={() => handleLinkClick('Cart (0)', undefined)}
              >
                Cart (0)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fake Login Section */}
      <FakeLogin />

      {/* Fake Dashboard Section */}
      <FakeDashboard />
    </div>
  );
}
