import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ActivityFeed from "@/components/activity-feed";
import AdvancedAnalytics from "@/components/advanced-analytics";
import TenantSelector from "@/components/tenant-selector";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWebSocket } from "@/hooks/use-websocket";

interface InteractionStats {
  totalInteractions: number;
  loginAttempts: number;
  productViews: number;
  navigationClicks: number;
  formInteractions: number;
}

const mockTopIPs = [
  { ip: '192.168.1.45', interactions: 23, risk: 'High' },
  { ip: '10.0.0.127', interactions: 18, risk: 'Medium' },
  { ip: '172.16.0.89', interactions: 12, risk: 'Low' },
  { ip: '203.0.113.12', interactions: 8, risk: 'Low' },
];

export default function AdminPage() {
  const [selectedTenant, setSelectedTenant] = useState<string>("");
  const { isConnected } = useWebSocket();

  const { data: stats, isLoading: statsLoading } = useQuery<InteractionStats>({
    queryKey: ['/api/interactions/stats', selectedTenant],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  return (
    <div className="space-y-6">
      {/* Header with Tenant Selector */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">System Status</h2>
          <div className="flex items-center space-x-4">
            <TenantSelector 
              selectedTenant={selectedTenant} 
              onTenantChange={setSelectedTenant} 
            />
            <div className="flex items-center space-x-2">
              <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-gray-600">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center">
              <div className="h-3 w-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-green-800">Deception Active</span>
            </div>
            <p className="text-xs text-green-600 mt-1">All honeypots operational</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <div className="h-3 w-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-blue-800">Real-time Monitoring</span>
            </div>
            <p className="text-xs text-blue-600 mt-1">WebSocket connection active</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center">
              <div className="h-3 w-3 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-yellow-800">Database</span>
            </div>
            <p className="text-xs text-yellow-600 mt-1">PostgreSQL connected</p>
          </div>
        </div>
      </div>

      {/* Tabbed Interface */}
      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activity">Live Activity</TabsTrigger>
          <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activity" className="space-y-6">
          <ActivityFeed />
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Interaction Types */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Interaction Types (Last 24h)</h3>
              {statsLoading ? (
                <div className="animate-pulse space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                      <div className="flex items-center">
                        <div className="h-2 bg-gray-200 rounded-full w-20 mr-2"></div>
                        <div className="h-4 bg-gray-300 rounded w-8"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Login Attempts</span>
                    <div className="flex items-center">
                      <div className="h-2 bg-red-200 rounded-full w-20 mr-2">
                        <div 
                          className="h-2 bg-red-500 rounded-full" 
                          style={{ width: `${Math.min((stats?.loginAttempts || 0) / Math.max(stats?.totalInteractions || 1, 1) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {stats?.loginAttempts || 0}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Product Views</span>
                    <div className="flex items-center">
                      <div className="h-2 bg-blue-200 rounded-full w-20 mr-2">
                        <div 
                          className="h-2 bg-blue-500 rounded-full" 
                          style={{ width: `${Math.min((stats?.productViews || 0) / Math.max(stats?.totalInteractions || 1, 1) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {stats?.productViews || 0}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Navigation Clicks</span>
                    <div className="flex items-center">
                      <div className="h-2 bg-green-200 rounded-full w-20 mr-2">
                        <div 
                          className="h-2 bg-green-500 rounded-full" 
                          style={{ width: `${Math.min((stats?.navigationClicks || 0) / Math.max(stats?.totalInteractions || 1, 1) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {stats?.navigationClicks || 0}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Form Interactions</span>
                    <div className="flex items-center">
                      <div className="h-2 bg-yellow-200 rounded-full w-20 mr-2">
                        <div 
                          className="h-2 bg-yellow-500 rounded-full" 
                          style={{ width: `${Math.min((stats?.formInteractions || 0) / Math.max(stats?.totalInteractions || 1, 1) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {stats?.formInteractions || 0}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Top IP Addresses */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Source IPs</h3>
              <div className="space-y-3">
                {mockTopIPs.map((ipData, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-900 font-mono">{ipData.ip}</span>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 mr-2">
                        {ipData.interactions} interactions
                      </span>
                      <Badge 
                        className={`text-xs ${
                          ipData.risk === 'High' 
                            ? 'bg-red-100 text-red-800 hover:bg-red-100' 
                            : ipData.risk === 'Medium' 
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' 
                            : 'bg-green-100 text-green-800 hover:bg-green-100'
                        }`}
                      >
                        {ipData.risk}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics">
          <AdvancedAnalytics />
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Reports</h3>
            <p className="text-gray-600">
              {stats ? `${stats.totalInteractions} total interactions captured` : 'Loading statistics...'}
            </p>
            <div className="mt-4 text-sm text-gray-500">
              Reports feature coming soon - comprehensive threat analysis and trending data.
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
