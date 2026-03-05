import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from 'react';
import { pauseTrack, playTrack, skipToNextTrack } from '@/services/player';

interface PlayerContextType {
  track: PlayerTrack | null;
  setTrack: (track: PlayerTrack | null) => void;
  tracksToPlay: string[];
  setTracksToPlay: (tracks: string[]) => void;
  isPlaying: boolean;
  playTrack: (track?: any, deviceId?: string) => Promise<void>;
  pauseTrack: () => Promise<void>;
  skipToNextTrack: () => Promise<void>;
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

  const handlePlayTrack = async (tracks?: string[], deviceId?: string) => {
    playTrack(tracks, deviceId).then(() => {
      setIsPlaying(true);
    });
  };

  const handlePauseTrack = async () => {
    setIsPlaying(false);
    await pauseTrack();
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
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}
