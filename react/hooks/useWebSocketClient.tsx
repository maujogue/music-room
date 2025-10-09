import { useState, useEffect } from 'react';
import { getSession } from '@/services/session';

export interface WebSocketActions {
  connected: boolean;
  sendVote: (eventId: string, trackId: string) => boolean;
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
        try {
          const data = JSON.parse(event.data);
          console.log('ws: message received', data.type);

          // Gérer les différents types de messages
          switch (data.type) {
            case 'connected':
              console.log('✅ WebSocket authenticated for user:', data.userId);
              break;
            case 'pong':
              console.log('🏓 Pong received from server');
              break;
            case 'vote:received':
              console.log('🗳️ Vote received:', data);
              break;
            case 'vote:confirmed':
              console.log('✅ Vote confirmed:', data);
              break;
            case 'subscribed':
              console.log('📋 Subscribed to event:', data.eventId);
              break;
            case 'error':
              console.error('❌ Server error:', data.message);
              break;
            default:
              console.log('ws: unhandled message type:', data.type);
          }
        } catch (error) {
          console.warn('ws: failed to parse message:', error);
        }
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

  const sendVote = (eventId: string, trackId: string): boolean => {
    if (!webSocket || webSocket.readyState !== WebSocket.OPEN) {
      console.warn('ws: cannot send vote, socket not open');
      return false;
    }

    try {
      const message = {
        type: 'vote',
        eventId,
        trackId,
        timestamp: Date.now()
      };

      webSocket.send(JSON.stringify(message));
      console.log(`📤 Vote sent for track ${trackId} in event ${eventId}`);
      return true;
    } catch (error) {
      console.error('ws: error sending vote:', error);
      return false;
    }
  };

  return { connected, sendPing, sendVote }
}
