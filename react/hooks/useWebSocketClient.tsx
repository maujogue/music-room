import { useState, useEffect, useCallback } from 'react';
import { getSession } from '@/services/session';

export interface TrackVote {
  eventId: string;
  eventName?: string;
  trackId: string;
  voteCount: number;
  voters: string[];
}

export interface WebSocketActions {
  connected: boolean;
  sendVote: (eventId: string, trackId: string) => boolean;
  sendPing: () => boolean;
  trackVotes: Map<string, TrackVote>;
  subscribeToVotes: (callback: (vote: TrackVote) => void) => () => void;
}

export default function useWebSocketClient(event_id: string): WebSocketActions {
  const serverUrl = process.env.EXPO_PUBLIC_WS_SERVER_URL || 'ws://localhost:8080/ws';
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [trackVotes, setTrackVotes] = useState<Map<string, TrackVote>>(new Map());
  const [voteCallbacks, setVoteCallbacks] = useState<Set<(vote: TrackVote) => void>>(new Set());

  useEffect(() => {
    const initWebSocket = async () => {
      console.log('ws: initializing connection to', serverUrl);
      const currentSession = await getSession();

      const url = `${serverUrl}?token=${encodeURIComponent(currentSession?.access_token || '')}`;
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('ws: connected to', url.replace(currentSession?.access_token, '***TOKEN***'));
        setConnected(true);
        ws.send(JSON.stringify({
          type: 'vote:get',
          eventId: event_id
        }));
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
            case 'subscribed':
              console.log('📋 Subscribed to event:', data.eventId);
              break;
            case 'error':
              console.error('❌ Server error:', data.message);
              break;
            case 'track_vote:update':
              handleTrackVoteUpdate(data);
              break;
            case 'vote:list':
              handleVoteList(data.votes);
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

  const sendUnvote = (eventId: string, trackId: string): boolean => {
    if (!webSocket || webSocket.readyState !== WebSocket.OPEN) {
      console.warn('ws: cannot send unvote, socket not open');
      return false;
    }

    try {
      const message = {
        type: 'unvote',
        eventId,
        trackId,
        timestamp: Date.now()
      };

      webSocket.send(JSON.stringify(message));
      console.log(`📤 Unvote sent for track ${trackId} in event ${eventId}`);
      return true;
    } catch (error) {
      console.error('ws: error sending unvote:', error);
      return false;
    }
  };

  const handleVoteList = useCallback((votes: any[]) => {
    console.log('📋 Processing vote list with', votes.length, 'entries');
    const newMap = new Map<string, TrackVote>();

    votes.forEach((vote) => {
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
          eventName
        };

        newMap.set(trackId, normalizedVote);
      } else {
        console.warn('📋 Vote missing trackId:', vote);
      }
    });

    setTrackVotes(newMap);
  }, []);

  const handleTrackVoteUpdate = useCallback((data: {
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
      voters: data.voters || []
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
  }, [voteCallbacks]);

  const subscribeToVotes = useCallback((callback: (vote: TrackVote) => void) => {
    setVoteCallbacks(prev => new Set([...prev, callback]));

    return () => {
      setVoteCallbacks(prev => {
        const newSet = new Set(prev);
        newSet.delete(callback);
        return newSet;
      });
    };
  }, []);

  return {
    connected,
    sendPing,
    sendVote,
    sendUnvote,
    trackVotes,
    subscribeToVotes
  }
}
