import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  type PropsWithChildren,
} from 'react';
import { pauseTrack, playTrack, skipToNextTrack, getCurrentUserCurrentlyPlayingTrack } from '@/services/player';

const REFRESH_INTERVAL = 5000;

interface PlayerContextType {
  track: PlayerTrack | null;
  setTrack: (track: PlayerTrack | null) => void;
  tracksToPlay: string[];
  setTracksToPlay: (tracks: string[]) => void;
  isPlaying: boolean;
  playTrack: (track: any) => Promise<void>;
  pauseTrack: () => Promise<void>;
  skipToNextTrack: () => Promise<void>;
  startAutoRefresh: () => void;
  stopAutoRefresh: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function usePlayer() {
  const context: PlayerContextType | undefined = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}

export function PlayerProvider({ children }: PropsWithChildren) {
  const [track, setTrack] = useState<any>(null);
  const [tracksToPlay, setTracksToPlay] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const refreshTrack = useCallback(async () => {
    try {
      const data = await getCurrentUserCurrentlyPlayingTrack();
      setTrack(data?.item || null);
      setIsPlaying(data?.is_playing || false);
    } catch (error) {
      console.error('Error refreshing track:', error);
    }
  }, []);

  const startAutoRefresh = useCallback(() => {
    if (intervalRef.current) return;

    refreshTrack();
    intervalRef.current = setInterval(() => {
      refreshTrack();
    }, REFRESH_INTERVAL);
  }, [refreshTrack]);

  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handlePlayTrack = async (tracks: string[]) => {
    setIsPlaying(true);
    playTrack(tracks);
  };

  const handlePauseTrack = async () => {
    setIsPlaying(false);
    pauseTrack();
  };

  const handleSkipToNextTrack = async () => {
    skipToNextTrack();
  };

  const value: PlayerContextType = {
    track,
    setTrack,
    tracksToPlay,
    setTracksToPlay,
    isPlaying,
    playTrack: handlePlayTrack,
    pauseTrack: handlePauseTrack,
    skipToNextTrack: handleSkipToNextTrack,
    startAutoRefresh,
    stopAutoRefresh
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}
