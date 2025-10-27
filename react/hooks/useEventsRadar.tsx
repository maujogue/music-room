import { useEffect, useState, useCallback } from 'react';
import { getEventsWithRadar } from '@/services/events';

export function useEventsRadar(coords: Coordinates | null) {
  const [events, setEvents] = useState<MusicEventFetchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const RadarEvents = useCallback(async () => {
    if (!coords) { return; }
    setLoading(true);
    setError(null);
    try {
      const data = await getEventsWithRadar(coords);
      setEvents(data || []);
    } catch (e) {
      console.error(`Error fetching Events at position (${coords.lat}, ${coords.long})`, e);
      setError('Radar events error');
    } finally {
      setLoading(false);
    }
  }, []);

  const launchRadar = useCallback(() => {
    RadarEvents();
  }, [RadarEvents]);

  useEffect(() => {
    RadarEvents();
  }, []);

  return { events, launchRadar, loading, error };
}