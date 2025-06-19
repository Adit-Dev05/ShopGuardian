import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/navigation";
import DeceptionPage from "@/pages/deception";
import AdminPage from "@/pages/admin";
import NotFound from "@/pages/not-found";
import { useWebSocket } from "@/hooks/use-websocket";

function Router() {
  const [currentView, setCurrentView] = useState<'deception' | 'admin'>('deception');
  
  // Initialize WebSocket connection
  useWebSocket();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Switch>
          <Route path="/" component={DeceptionPage} />
          <Route path="/deception" component={DeceptionPage} />
          <Route path="/admin" component={AdminPage} />
          <Route component={NotFound} />
        </Switch>
        
        {/* Show current view content */}
        {currentView === 'deception' ? <DeceptionPage /> : <AdminPage />}
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
