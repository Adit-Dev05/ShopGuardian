import { useEffect, useRef, useState } from 'react';
import { queryClient } from '@/lib/queryClient';

interface WebSocketMessage {
  type: string;
  data: any;
}

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws`;
    
    const connect = () => {
      try {
        ws.current = new WebSocket(wsUrl);
        
        ws.current.onopen = () => {
          console.log('WebSocket connected');
          setIsConnected(true);
        };
        
        ws.current.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            setLastMessage(message);
            
            // Handle different message types
            switch (message.type) {
              case 'new_interaction':
                // Invalidate interactions queries to trigger refetch
                queryClient.invalidateQueries({ queryKey: ['/api/interactions'] });
                queryClient.invalidateQueries({ queryKey: ['/api/interactions/stats'] });
                break;
              case 'risk_alert':
                // Handle risk alerts
                queryClient.invalidateQueries({ queryKey: ['/api/analytics/risk'] });
                break;
              default:
                console.log('Unknown WebSocket message type:', message.type);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        ws.current.onclose = () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);
          
          // Attempt to reconnect after 3 seconds
          setTimeout(connect, 3000);
        };
        
        ws.current.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        setTimeout(connect, 5000);
      }
    };
    
    connect();
    
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const sendMessage = (message: WebSocketMessage) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  };

  return {
    isConnected,
    lastMessage,
    sendMessage,
  };
}