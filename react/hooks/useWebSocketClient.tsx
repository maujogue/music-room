import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { getSession } from '@/services/session';
import { useCurrentPosition } from './useCurrentPosition';

export interface TrackVote {
  eventId: string;
  eventName?: string;
  trackId: string;
  voteCount: number;
  voters: string[];
}

export interface EventUserData {
  userId: string;
  vote_remaining: number;
  voteCount: number;
  voteMax: number;
  voted_tracks: Record<string, number>;
}

export interface WebSocketActions {
  connected: boolean;
  track: PlayerTrack | null;
  sendVote: (eventId: string, trackId: string) => boolean;
  sendUnvote: (eventId: string, trackId: string) => boolean;
  sendPing: () => boolean;
  trackVotes: Map<string, TrackVote>;
  eventUserData: EventUserData | null;
  subscribeToVotes: (callback: (vote: TrackVote) => void) => () => void;
  connectionAttempts: number;
  lastError: string | null;
  reconnect: () => void;
  disconnect: () => void;
}

type Options = {
  enabled?: boolean, 
  spatio_licence? : boolean
  done? : boolean
}

export default function useWebSocketClient(event_id: string, opts?: Options, isPing?: boolean): WebSocketActions {
  const { enabled = true, done = false,  spatio_licence = false } = opts ?? {};
  const serverUrl =
    process.env.EXPO_PUBLIC_WS_SERVER_URL || 'ws://localhost:8080/ws';
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
  const webSocketRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [trackVotes, setTrackVotes] = useState<Map<string, TrackVote>>(
    new Map()
  );
  const [voteCallbacks, setVoteCallbacks] = useState<
    Set<(vote: TrackVote) => void>
  >(new Set());
  const [eventUserData, setEventUserData] = useState<EventUserData | null>(
    null
  );
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const [track, setTrack] = useState<PlayerTrack| null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const pingIntervalRef = useRef<number | null>(null);
  const shouldReconnectRef = useRef<boolean>(true);
  const connectionAttemptsRef = useRef<number>(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;
  const pingInterval = 1000;

  const { coords, loading, error } = useCurrentPosition({radiusKm: 50})

  const hasPosition = useCallback(async () => {
    if (loading || error) { return false }
    if (coords) { return true }
  }, [coords])

  const checkTokenValidity = useCallback(async () => {
    try {
      const session = await getSession();
      if (!session?.access_token) {
        return false;
      }

      if (session.expires_at) {
        const expirationTime = new Date(session.expires_at).getTime();
        const currentTime = Date.now();
        const fiveMinutes = 5 * 60 * 1000;

        if (expirationTime - currentTime < fiveMinutes) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('🔐 Error checking token validity:', error);
      return false;
    }
  }, []);

  const initWebSocket = useCallback(async () => {
    try {
      if (!enabled || done) return;
      if (!shouldReconnectRef.current) {
        console.log('ws: init aborted — reconnection disabled');
        return;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      console.log('ws: initializing connection to', serverUrl);
      const currentSession = await getSession();

      if (!currentSession?.access_token) {
        setLastError('No valid session token available');
        return;
      }

      const url = `${serverUrl}?token=${encodeURIComponent(currentSession.access_token)}`;
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('✅ ws: connection established successfully');
        setConnected(true);
        setConnectionAttempts(0);
        connectionAttemptsRef.current = 0;
        setLastError(null);

        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }
        pingIntervalRef.current = window.setInterval(() => {
          console.log('🏓 Auto-ping interval triggered');
          console.log('if', JSON.stringify((isPing), null, 2))
          if (ws.readyState === WebSocket.OPEN && isPing) {
            ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now(), eventId: event_id }));
            console.log('🏓 Auto-ping sent (with eventId)', { eventId: event_id });
          }
        }, pingInterval);

        sendRequestUserInfo(ws);
        ws.send(
          JSON.stringify({
            type: 'vote:get',
            eventId: event_id,
          })
        );
      };

      ws.onclose = event => {
        console.log('ws: connection closed', {
          code: event.code,
          reason: event.reason,
        });
        setConnected(false);

        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        if (
          event.code !== 1000 &&
          shouldReconnectRef.current &&
          connectionAttemptsRef.current < maxReconnectAttempts
        ) {
          console.log(
            `🔄 Auto-reconnect in ${reconnectDelay}ms (attempt ${connectionAttemptsRef.current + 1}/${maxReconnectAttempts})`
          );
          reconnectTimeoutRef.current = window.setTimeout(() => {
            connectionAttemptsRef.current += 1;
            setConnectionAttempts(connectionAttemptsRef.current);
            initWebSocket();
          }, reconnectDelay);
        } else {
          console.log(
            'ws: not reconnecting (intentional close or max attempts reached)'
          );
        }
      };

      ws.onerror = () => {
        setLastError('Connection error occurred');
        setConnected(false);
      };

      ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          console.log('ws: message received', data.type);

          switch (data.type) {
            case 'subscribed':
              console.log('📋 Subscribed to event:', data.eventId);
              break;
            case 'error':
              setLastError(data.message ?? 'some error');
              break;
            case 'pong':
              break;
            case 'track_vote:update':
              console.log('ws: track_vote:update received', data);
              handleTrackVoteUpdate(data);
              break;
            case 'vote:confirmed':
              sendRequestUserInfo();
              break;
            case 'unvote:error':
              setLastError(data.message);
              break;
            case 'unvote:confirmed':
              sendRequestUserInfo();
              break;
            case 'vote:list':
              handleVoteList(data.votes);
              break;
            case 'user:info:response':
              handleUserInfo(data);
              break;
            case 'event_current_track:update':
              handleTrackPlay(data);
              break;
            default:
              console.log('ws: unhandled message type:', data.type);
          }
        } catch (error) {
          console.warn('ws: failed to parse message:', error);
        }
      };

      setWebSocket(ws);
      webSocketRef.current = ws;
    } catch (error) {
      console.error('ws: failed to initialize WebSocket:', error);
      setLastError('Failed to initialize WebSocket connection');
      setConnected(false);
    }
  }, [enabled, done]);

  useEffect(() => {
    initWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }

      if (webSocketRef.current) {
        try {
          shouldReconnectRef.current = false;
          webSocketRef.current.close(1000, 'Component unmounted');
        } catch {
        }
        webSocketRef.current = null;
        setWebSocket(null);
      }
    };
  }, [initWebSocket, enabled, done]);

  // Listen to app state and close websocket when app is backgrounded to avoid reconnect loops
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const active = nextAppState === 'active';
      if (!active) {
        console.log(
          'ws: app not active — closing socket and disabling reconnects'
        );
        shouldReconnectRef.current = false;

        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }

        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        if (webSocketRef.current) {
          try {
            webSocketRef.current.close(1000, 'App backgrounded');
          } catch {
          }
          webSocketRef.current = null;
          setWebSocket(null);
        }
      } else {
        // App became active again: allow reconnects and reset attempts
        console.log('ws: app active — enabling reconnects');
        shouldReconnectRef.current = true;
        connectionAttemptsRef.current = 0;
        setConnectionAttempts(0);
        initWebSocket();
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [initWebSocket, enabled, done]);

  const sendRequestUserInfo = useCallback(
    (ws?: WebSocket) => {
      const socketToUse = ws || webSocketRef.current || webSocket;

      if (socketToUse && socketToUse.readyState === WebSocket.OPEN) {
        socketToUse.send(
          JSON.stringify({
            type: 'user:info',
            eventId: event_id,
          })
        );
      } else {
        console.warn(
          'ws: cannot send user info request - socket not available or not open'
        );
        console.warn('ws: socket readyState:', socketToUse?.readyState);
      }
    },
    [event_id, webSocket]
  );

  const sendPing = (): boolean => {
    if (webSocket && webSocket.readyState === WebSocket.OPEN) {
      webSocket.send(JSON.stringify({ 
        type: 'ping',
        eventId: event_id
      }));
      console.log('ws: ping sent');
      return true;
    }
    console.warn('ws: cannot send ping, socket not open');
    return false;
  };

  const sendVote = async (eventId: string, trackId: string): Promise<boolean> => {
    if (!webSocket || webSocket.readyState !== WebSocket.OPEN) {
      console.warn('ws: cannot send vote, socket not open');
      return false;
    }

    if (spatio_licence) {
      const isOk = await hasPosition()
      if (!isOk) {
        console.warn('ws: cannot send vote, need user position');
        return false;
      }
    }

    console.log(`ws: sending vote for track ${trackId} in event ${eventId}`);
    try {
      const message = {
        type: 'vote',
        eventId,
        trackId,
        timestamp: Date.now(),
        coordinates: coords
      };

      webSocket.send(JSON.stringify(message));
      console.log(`📤 Vote sent for track ${trackId} in event ${eventId}`);
      return true;
    } catch (error) {
      console.error('ws: error sending vote:', error);
      return false;
    }
  };

  const sendUnvote = async (eventId: string, trackId: string): Promise<boolean> => {
    if (!webSocket || webSocket.readyState !== WebSocket.OPEN) {
      console.warn('ws: cannot send unvote, socket not open');
      return false;
    }

    if (spatio_licence) {
      const isOk = await hasPosition()
      if (!isOk) {
        console.warn('ws: cannot send vote, need user position');
        return false;
      }
    }

    try {
      const message = {
        type: 'unvote',
        eventId,
        trackId,
        timestamp: Date.now(),
        coordinates: coords
      };

      webSocket.send(JSON.stringify(message));
      console.log(`📤 Unvote sent for track ${trackId} in event ${eventId}`);
      return true;
    } catch (error) {
      console.error('ws: error sending unvote:', error);
      return false;
    }
  };

  const handleUserInfo = useCallback(
    (data: {
      userId: string;
      vote_remaining: number;
      voteCount: number;
      voteMax: number;
      voted_tracks: Record<string, number>;
    }) => {
      console.log('📊 Received user info:', data);

      const newUserData = {
        userId: data.userId,
        vote_remaining: data.vote_remaining,
        voteCount: data.voteCount,
        voteMax: data.voteMax,
        voted_tracks: data.voted_tracks,
      };

      console.log('📊 Setting eventUserData to:', newUserData);
      setEventUserData(newUserData);
    },
    []
  );

  const handleTrackPlay = useCallback((data) => {
    setTrack(data.track);
  }, []);

  const handleVoteList = useCallback((votes: any[]) => {
    const newMap = new Map<string, TrackVote>();

    votes.forEach(vote => {
      const trackId = vote.trackId || vote.track_id;
      const eventId = vote.eventId || vote.event_id;
      const voteCount = vote.voteCount || vote.vote_count;
      const voters = vote.voters || [];
      const eventName = vote.eventName || vote.event_name;

      if (trackId) {
        const normalizedVote: TrackVote = {
          trackId,
          eventId,
          voteCount,
          voters,
          eventName,
        };

        newMap.set(trackId, normalizedVote);
      } else {
        console.warn('📋 Vote missing trackId:', vote);
      }
    });

    setTrackVotes(newMap);
  }, []);

  const handleTrackVoteUpdate = useCallback(
    (data: {
      eventId: string;
      eventName?: string;
      trackId: string;
      voteCount: number;
      voters: string[];
    }) => {
      const trackVote: TrackVote = {
        eventId: data.eventId,
        eventName: data.eventName,
        trackId: data.trackId,
        voteCount: data.voteCount,
        voters: data.voters || [],
      };

      setTrackVotes(prev => {
        const newMap = new Map(prev);
        newMap.set(data.trackId, trackVote);
        return newMap;
      });

      voteCallbacks.forEach(callback => {
        try {
          callback(trackVote);
        } catch (error) {
          console.error('Error in vote callback:', error);
        }
      });
    },
    [voteCallbacks]
  );

  const subscribeToVotes = useCallback(
    (callback: (vote: TrackVote) => void) => {
      setVoteCallbacks(prev => new Set([...prev, callback]));

      return () => {
        setVoteCallbacks(prev => {
          const newSet = new Set(prev);
          newSet.delete(callback);
          return newSet;
        });
      };
    },
    []
  );

  const reconnect = useCallback(async () => {
    console.log('ws: manual reconnection requested');

    const tokenValid = await checkTokenValidity();
    if (!tokenValid) {
      setLastError('Session expired. Please login again.');
      return;
    }

    if (!shouldReconnectRef.current) {
      console.log('ws: reconnect aborted — reconnections disabled');
      return;
    }

    if (connectionAttemptsRef.current >= maxReconnectAttempts) {
      console.error('ws: max reconnection attempts reached');
      setLastError('Unable to reconnect to server. Please refresh the app.');
      return;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }

    connectionAttemptsRef.current += 1;
    setConnectionAttempts(connectionAttemptsRef.current);
    setLastError(null);
    initWebSocket();
  }, [initWebSocket, checkTokenValidity, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    console.log('ws: manual disconnect requested');

    shouldReconnectRef.current = false;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }

    if (webSocketRef.current) {
      webSocketRef.current.close(1000, 'Manual disconnect');
      webSocketRef.current = null;
    }
    setWebSocket(null);
    setConnected(false);
    connectionAttemptsRef.current = 0;
    setConnectionAttempts(0);
    setLastError(null);
  }, []);

  return {
    connected,
    track,
    sendPing,
    sendVote,
    sendUnvote,
    trackVotes,
    subscribeToVotes,
    eventUserData,
    connectionAttempts,
    lastError,
    reconnect,
    disconnect,
  };
}
