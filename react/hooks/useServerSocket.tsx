import { useEffect, useRef, useState, useCallback } from 'react';

type MsgHandler = (data: any) => void;

interface Opts {
  onMessage?: MsgHandler;
  onOpen?: () => void;
  onClose?: () => void;
  autoReconnect?: boolean;
  maxRetries?: number;
  heartbeatIntervalMs?: number; // optional heartbeat "ping" messages
}

/**
 * serverUrl should be like: "wss://example.com/ws" or "ws://localhost:8080/ws"
 * token is the user's access_token (string)
 */
export default function useServerSocket(
  serverUrl: string,
  token?: string,
  opts: Opts = {}
) {
  console.log('useServerSocket called with', { serverUrl, token });
  const { onMessage, onOpen, onClose, autoReconnect = true, maxRetries = 8, heartbeatIntervalMs = 30000 } = opts;
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef(0);
  const reconnectTimerRef = useRef<number | null>(null);
  const heartbeatRef = useRef<number | null>(null);
  const [connected, setConnected] = useState(false);

  const connect = useCallback(() => {
    // build url with token in query
    const url = token ? `${serverUrl}?token=${encodeURIComponent(token)}` : serverUrl;
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        retryRef.current = 0;
        setConnected(true);
        onOpen?.();

        // start heartbeat (simple JSON ping)
        if (heartbeatIntervalMs > 0) {
          if (heartbeatRef.current) clearInterval(heartbeatRef.current);
          heartbeatRef.current = setInterval(() => {
            try { ws.send(JSON.stringify({ type: 'ping', ts: Date.now() })); } catch (_) {}
          }, heartbeatIntervalMs) as unknown as number;
        }
      };

      ws.onmessage = (ev) => {
        try {
          const data = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data;
          onMessage?.(data);
        } catch (e) {
          console.warn('ws: invalid message', e);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        onClose?.();
        if (heartbeatRef.current) { clearInterval(heartbeatRef.current); heartbeatRef.current = null; }
        wsRef.current = null;
        if (autoReconnect) {
          // exponential backoff
          const attempts = ++retryRef.current;
          if (attempts <= maxRetries) {
            const delay = Math.min(30000, 500 * 2 ** attempts);
            reconnectTimerRef.current = setTimeout(() => connect(), delay) as unknown as number;
          } else {
            console.warn('ws: max reconnect attempts reached');
          }
        }
      };

      ws.onerror = (err) => {
        // will trigger onclose after error in RN
        console.warn('ws error', err);
      };
    } catch (err) {
      console.error('ws connect failed', err);
    }
  }, [serverUrl, token, onMessage, onOpen, onClose, autoReconnect, maxRetries, heartbeatIntervalMs]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      try { wsRef.current?.close(); } catch (_) {}
      wsRef.current = null;
    };
  }, [connect]);

  const send = useCallback((obj: any) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    try {
      ws.send(typeof obj === 'string' ? obj : JSON.stringify(obj));
      return true;
    } catch (err) {
      console.warn('ws send failed', err);
      return false;
    }
  }, []);

  const close = useCallback(() => {
    autoReconnect && (retryRef.current = Number.MAX_SAFE_INTEGER); // stop reconnect attempts
    try { wsRef.current?.close(); } catch (_) {}
  }, [autoReconnect]);

  return { connected, send, close };
}
