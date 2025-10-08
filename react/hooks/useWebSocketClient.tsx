import { useState, useEffect } from 'react';
import { getSession } from '@/services/session';

export interface WebSocketActions {
  connected: boolean;
  sendVote: (eventId: string, trackId: string, vote: 'like' | 'dislike') => boolean;
  subscribeToEvent: (eventId: string) => boolean;
  unsubscribeFromEvent: (eventId: string) => boolean;
  sendPing: () => boolean;
}

export default function useWebSocketClient(): WebSocketActions {
  const serverUrl = process.env.EXPO_PUBLIC_WS_SERVER_URL || 'ws://localhost:8080/ws';
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const initWebSocket = async () => {
      console.log('ws: initializing connection to', serverUrl);
      const currentSession = await getSession();

      const url = `${serverUrl}?token=${encodeURIComponent(currentSession?.access_token || '')}`;
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('ws: connected to', url.replace(currentSession?.access_token, '***TOKEN***'));
        setConnected(true);
      };

      ws.onclose = () => {
        console.log('ws: connection closed');
        setConnected(false);
      };

      ws.onerror = (error) => {
        console.error('ws: error occurred', error);
      };

      ws.onmessage = (event) => {
        console.log('ws: message received', event.data);
      };

      setWebSocket(ws);
    };

    initWebSocket();
  }, []);

  const sendPing = (): boolean => {
    if (webSocket && webSocket.readyState === WebSocket.OPEN) {
      webSocket.send(JSON.stringify({ type: 'ping' }));
      console.log('ws: ping sent');
      return true;
    }
    console.warn('ws: cannot send ping, socket not open');
    return false;
  };

  return { connected, sendPing}
}
