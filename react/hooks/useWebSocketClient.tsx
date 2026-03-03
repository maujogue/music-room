import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { getSession, refreshSession } from '@/services/session';
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
  sendVote: (eventId: string, trackId: string) => Promise<boolean>;
  sendUnvote: (eventId: string, trackId: string) => Promise<boolean>;
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
  enabled?: boolean;
  spatio_licence?: boolean;
  done?: boolean;
};

export default function useWebSocketClient(
  event_id: string,
  opts?: Options,
  isOwner?: boolean
): WebSocketActions {
  const { enabled = true, done = false, spatio_licence = false } = opts ?? {};
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
  const [track, setTrack] = useState<PlayerTrack | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const pingIntervalRef = useRef<number | null>(null);
  const shouldReconnectRef = useRef<boolean>(true);
  const connectionAttemptsRef = useRef<number>(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;
  const pingInterval = 1000;

  const { coords, loading, error } = useCurrentPosition({ radiusKm: 50 });

  const hasPosition = useCallback(async () => {
    if (loading || error) {
      return false;
    }
    if (coords) {
      return true;
    }
  }, [coords]);

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
        return;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      const currentSession = await getSession();

      if (!currentSession?.access_token) {
        setLastError('No valid session token available');
        return;
      }

      const url = `${serverUrl}?token=${encodeURIComponent(currentSession.access_token)}&eventId=${encodeURIComponent(event_id)}`;
      const ws = new WebSocket(url);

      ws.onopen = () => {
        setConnected(true);
        setConnectionAttempts(0);
        connectionAttemptsRef.current = 0;
        setLastError(null);

        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }
        pingIntervalRef.current = window.setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(
              JSON.stringify({
                type: 'ping',
                timestamp: Date.now(),
                eventId: event_id,
              })
            );
            if (isOwner) {
              ws.send(
                JSON.stringify({
                  type: 'event_current_track:get',
                  eventId: event_id,
                })
              );
            }
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
          reconnectTimeoutRef.current = window.setTimeout(() => {
            connectionAttemptsRef.current += 1;
            setConnectionAttempts(connectionAttemptsRef.current);
            initWebSocket();
          }, reconnectDelay);
        } else {
          // not reconnecting (intentional close or max attempts reached)
        }
      };

      ws.onerror = () => {
        setLastError('Connection error occurred');
        setConnected(false);
      };

      ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'subscribed':
              break;
            case 'error':
              setLastError(data.message ?? 'some error');
              break;
            case 'pong':
              break;
            case 'track_vote:update':
              handleTrackVoteUpdate(data);
              sendRequestUserInfo();
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
              // unhandled message type
              break;
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
          console.warn('ws: error closing socket on unmount');
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
            console.warn('ws: error closing socket on app background');
          }
          webSocketRef.current = null;
          setWebSocket(null);
        }
      } else {
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
      webSocket.send(
        JSON.stringify({
          type: 'ping',
          eventId: event_id,
        })
      );
      return true;
    }
    console.warn('ws: cannot send ping, socket not open');
    return false;
  };

  const sendVote = async (
    eventId: string,
    trackId: string
  ): Promise<boolean> => {
    if (!webSocket || webSocket.readyState !== WebSocket.OPEN) {
      console.warn('ws: cannot send vote, socket not open');
      return false;
    }

    if (spatio_licence) {
      const isOk = await hasPosition();
      if (!isOk) {
        console.warn('ws: cannot send vote, need user position');
        return false;
      }
    }

    try {
      const cleanTrackId = trackId.replace('spotify:track:', '');
      const message = {
        type: 'vote',
        eventId,
        trackId: cleanTrackId,
        timestamp: Date.now(),
        coordinates: coords,
      };

      webSocket.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('ws: error sending vote:', error);
      return false;
    }
  };

  const sendUnvote = async (
    eventId: string,
    trackId: string
  ): Promise<boolean> => {
    if (!webSocket || webSocket.readyState !== WebSocket.OPEN) {
      console.warn('ws: cannot send unvote, socket not open');
      return false;
    }

    if (spatio_licence) {
      const isOk = await hasPosition();
      if (!isOk) {
        console.warn('ws: cannot send vote, need user position');
        return false;
      }
    }

    try {
      const cleanTrackId = trackId.replace('spotify:track:', '');
      const message = {
        type: 'unvote',
        eventId,
        trackId: cleanTrackId,
        timestamp: Date.now(),
        coordinates: coords,
      };

      webSocket.send(JSON.stringify(message));
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
      const newUserData = {
        userId: data.userId,
        vote_remaining: data.vote_remaining,
        voteCount: data.voteCount,
        voteMax: data.voteMax,
        voted_tracks: data.voted_tracks,
      };

      setEventUserData(newUserData);
    },
    []
  );

  const handleTrackPlay = useCallback((data: any) => {
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
    const refreshed = await refreshSession();
    if (!refreshed) {
      setLastError('Session expired. Please login again.');
      return;
    }
    const tokenValid = await checkTokenValidity();
    if (!tokenValid) {
      setLastError('Session expired. Please login again.');
      return;
    }

    if (!shouldReconnectRef.current) {
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
