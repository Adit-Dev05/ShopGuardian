import { useQuery } from "@tanstack/react-query";
import { Interaction } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";

const getInteractionColor = (type: string) => {
  switch (type) {
    case 'login_attempt':
      return 'bg-red-500';
    case 'product_view':
      return 'bg-yellow-500';
    case 'navigation_click':
      return 'bg-blue-500';
    case 'form_focus':
    case 'form_input':
      return 'bg-green-500';
    case 'session_start':
      return 'bg-purple-500';
    default:
      return 'bg-gray-500';
  }
};

const getInteractionTitle = (interaction: Interaction) => {
  switch (interaction.type) {
    case 'login_attempt':
      return 'Login attempt captured';
    case 'product_view':
      return 'Product inventory accessed';
    case 'navigation_click':
      return 'Navigation interaction';
    case 'form_focus':
      return 'Form field focused';
    case 'form_input':
      return 'Form input detected';
    case 'session_start':
      return 'Session started';
    case 'view_switch':
      return 'View switched';
    default:
      return 'Unknown interaction';
  }
};

const getInteractionDescription = (interaction: Interaction) => {
  const data = interaction.data as any;
  
  switch (interaction.type) {
    case 'login_attempt':
      return `IP: ${interaction.ip} • Email: ${data?.email || 'N/A'}`;
    case 'product_view':
      return `IP: ${interaction.ip} • Viewed ${data?.product || 'unknown product'}`;
    case 'navigation_click':
      return `IP: ${interaction.ip} • Clicked on ${data?.text || 'unknown element'}`;
    case 'form_focus':
      return `IP: ${interaction.ip} • Focused ${data?.field || 'unknown field'} field`;
    case 'form_input':
      return `IP: ${interaction.ip} • Input in ${data?.field || 'unknown field'} (${data?.length || 0} chars)`;
    case 'session_start':
      return `IP: ${interaction.ip} • First-time visitor`;
    case 'view_switch':
      return `IP: ${interaction.ip} • Switched to ${data?.target || 'unknown'} view`;
    default:
      return `IP: ${interaction.ip} • ${interaction.userAgent?.split(' ')[0] || 'Unknown browser'}`;
  }
};

const formatTimeAgo = (timestamp: Date) => {
  const now = new Date();
  const diff = now.getTime() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

export default function ActivityFeed() {
  const { data: interactions = [], isLoading } = useQuery<Interaction[]>({
    queryKey: ['/api/interactions'],
    refetchInterval: 2000, // Refresh every 2 seconds for real-time updates
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <p className="mt-1 text-sm text-gray-600">Live interaction monitoring</p>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <p className="mt-1 text-sm text-gray-600">Live interaction monitoring</p>
      </div>
      <ScrollArea className="h-96">
        <div className="divide-y divide-gray-200">
          {interactions.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No interactions logged yet.
            </div>
          ) : (
            interactions.map((interaction) => (
              <div key={interaction.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`h-2 w-2 ${getInteractionColor(interaction.type)} rounded-full mr-3`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {getInteractionTitle(interaction)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getInteractionDescription(interaction)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatTimeAgo(interaction.timestamp)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
