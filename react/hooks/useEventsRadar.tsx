import { useEffect, useState, useCallback } from 'react';
import { getEventsWithRadar } from '@/services/events';

export function useEventsRadar(coords: Coordinates | null) {
  const [events, setEvents] = useState<MusicEventRadarResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const RadarEvents = useCallback(async () => {
    if (!coords) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getEventsWithRadar(coords);
      console.log("-------------------------DATA RADAR EVENT \n", data)
      setEvents(data || []);
    } catch (e) {
      console.error(`Error fetching Events at position (${coords.lat}, ${coords.long})`, e);
      setError('Radar events error');
    } finally {
      setLoading(false);
    }
  }, [coords]);

  const launchRadar = useCallback(() => {
    RadarEvents();
  }, [RadarEvents]);

  useEffect(() => {
    RadarEvents();
  }, [coords]);

  return { events, launchRadar, loading, error };
}