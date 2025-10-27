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

  function getBoundingBox(
    latitude: number,
    longitude: number,
    radiusKm: number
  ) {
    const earthRadiusKm = 6371;
    const radLat = (latitude * Math.PI) / 180;
    const radDist = radiusKm / earthRadiusKm;

    // 1° de latitude ≈ 111 km (constante)
    const latDelta = radiusKm / 111;
    // 1° de longitude ≈ 111 * cos(latitude)
    const longDelta = radiusKm / (111 * Math.cos(radLat));

    return {
      latMin: latitude - latDelta,
      latMax: latitude + latDelta,
      longMin: longitude - longDelta,
      longMax: longitude + longDelta,
    };
  }

  const launchRadar = useCallback(() => {
    RadarEvents();
  }, [RadarEvents]);

  useEffect(() => {
    RadarEvents();
  }, []);

  return { events, launchRadar, loading, error };
}