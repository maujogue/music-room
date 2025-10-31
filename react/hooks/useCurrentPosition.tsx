import { useEffect, useMemo, useState } from 'react';
import * as Location from 'expo-location';
import type { Region } from 'react-native-maps';

type Props = {
  radiusKm?: number;
};

export function useCurrentPosition({ radiusKm = 50 }: Props) {
  const [status, setStatus] = useState<Location.PermissionStatus | null>(null);
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      const { status } = await Location.requestForegroundPermissionsAsync();
      setStatus(status);
      if (status === Location.PermissionStatus.GRANTED) {
        
        // console.log("Using mock data position...  Android emulator getCurrentPositionAsync broken yet")
        // setCoords({
        //   lat: 37.42205, // google Fallback
        //   long: -122.0853,
        // });
        
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setCoords({
          lat: position.coords.latitude,
          long: position.coords.longitude,
        });
        
      } else {
        setError('Localisation authorization required.');
      }

      setLoading(false);
    })();
  }, []);

  const region: Region | undefined = useMemo(() => {
    if (!coords) return undefined;
    const lat = coords.lat;
    const diameterKm = radiusKm * 2;
    const latitudeDelta = diameterKm / 111;
    const cosLat = Math.cos((lat * Math.PI) / 180);
    const safeCos = Math.max(cosLat, 0.01);
    const longitudeDelta = diameterKm / (111 * safeCos);

    return {
      latitude: lat,
      longitude: coords.long,
      latitudeDelta,
      longitudeDelta,
    };
  }, [coords, radiusKm]);

  return {
    coords,
    loading,
    error,
    region,
  };
}
