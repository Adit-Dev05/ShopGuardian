import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { interactionLogger } from "@/lib/interaction-logger";

interface NavigationProps {
  currentView: 'deception' | 'admin';
  onViewChange: (view: 'deception' | 'admin') => void;
}

export default function Navigation({ currentView, onViewChange }: NavigationProps) {
  const handleViewChange = (view: 'deception' | 'admin') => {
    onViewChange(view);
    interactionLogger.logViewSwitch(view);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">ShopGuardian</h1>
            <Badge className="ml-3 bg-green-100 text-green-800 hover:bg-green-100">
              Active
            </Badge>
          </div>
          <div className="flex space-x-4">
            <Button
              onClick={() => handleViewChange('deception')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                currentView === 'deception'
                  ? 'text-white walmart-blue hover:walmart-dark-blue'
                  : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Deception Interface
            </Button>
            <Button
              onClick={() => handleViewChange('admin')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                currentView === 'admin'
                  ? 'text-white walmart-blue hover:walmart-dark-blue'
                  : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Admin Dashboard
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
