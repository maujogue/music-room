import { useState, useCallback, useRef } from 'react';
import {
  pauseTrack,
  playTrack,
  skipToNextTrack,
  getCurrentUserCurrentlyPlayingTrack,
} from '@/services/player';
import { useFocusEffect } from '@react-navigation/native';

const REFRESH_INTERVAL = 5000;

export const usePlayer = () => {
  const [track, setTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);

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

  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused - starting auto refresh');
      startAutoRefresh();

      return () => {
        console.log('Screen unfocused - stopping auto refresh');
        stopAutoRefresh();
      };
    }, [startAutoRefresh, stopAutoRefresh])
  );

  const handlePlayPause = useCallback(async () => {
    try {
      const newPlayingState = !isPlaying;
      setIsPlaying(newPlayingState);

      if (isPlaying) {
        await pauseTrack();
      } else {
        await playTrack(track?.uri || '');
      }

      setTimeout(() => refreshTrack(), 1000);
    } catch (error) {
      console.error('Error toggling play/pause:', error);
      setIsPlaying(isPlaying);
    }
  }, [isPlaying, track?.uri, refreshTrack]);

  const handleNext = useCallback(async () => {
    try {
      await skipToNextTrack();
      setTimeout(() => {
        refreshTrack();
      }, 100);
    } catch (error) {
      console.error('Error skipping to next track:', error);
    }
  }, [refreshTrack]);

  return {
    track,
    isPlaying,
    refreshTrack,
    handlePlayPause,
    handleNext,
  };
};
