import { useEffect, useMemo, useState } from 'react';
import * as Location from 'expo-location';
import type { Region } from 'react-native-maps';

type Props = {
  radiusKm?: number;
};

const googleFallback = { lat: 37.4221, long: -122.0581 }

async function getSafeCurrentCoords(): Promise<Coordinates | null> {
  try {
    const position = await Promise.race([
      Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout GPS")), 5000)
      ),
    ]);

    return {
      lat: position.coords.latitude,
      long: position.coords.longitude,
    };
  } catch {
    return null;
  }
}

async function getInitialCoords(): Promise<Coordinates> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== Location.PermissionStatus.GRANTED) {
    throw new Error("Localisation authorization required.");
  }

  const current = await getSafeCurrentCoords();
  if (current) return current;

  try {
    const last = await Location.getLastKnownPositionAsync();
    if (last) {
      return {
        lat: last.coords.latitude,
        long: last.coords.longitude,
      };
    }
  } catch {
  }

  return googleFallback;
}


export function useCurrentPosition({ radiusKm = 50 }: Props) {  
  const [status, setStatus] = useState<Location.PermissionStatus | null>(null);
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

    useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        setStatus(status);

        if (status !== Location.PermissionStatus.GRANTED) {
          const { status: requestedStatus } =
            await Location.requestForegroundPermissionsAsync();
          setStatus(requestedStatus);

          if (requestedStatus !== Location.PermissionStatus.GRANTED) {
            throw new Error("Localisation authorization required.");
          }
        }

        const c = await getInitialCoords();

        if (!cancelled) {
          setCoords(c);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message ?? "Error while getting location.");
          setCoords(googleFallback);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
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
