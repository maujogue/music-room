import { useMemo } from 'react';

export function parsePointCoordinates(
  pointString: string
): { x: number; y: number } | null {
  if (!pointString) return null;

  // Expected Format : "(x,y)" or "EventLocationInfo (x,y)"
  const match = pointString.match(/\(([^,]+),([^)]+)\)/);

  if (!match) return null;

  const x = parseFloat(match[1].trim());
  const y = parseFloat(match[2].trim());

  if (isNaN(x) || isNaN(y)) return null;

  return { x, y };
}

export function useEventCoordinates(event: any | null) {
  return useMemo(() => {
    if (!event || !event.adresses.length) return null;

    const address = event.adresses[0];
    const coords = parsePointCoordinates(address.coordinates);

    return coords
      ? {
          x: coords.x,
          y: coords.y,
          latitude: coords.y,
          longitude: coords.x,
          address,
        }
      : null;
  }, [event]);
}

export function parseLocation(
  location: MusicEventLocation | undefined | null
): PickedPlace | null {
  if (!location) return null;

  const coords = location.coordinates
  if (!coords) return null;

  return {
    latitude: coords.lat,
    longitude: coords.long,
    address: location.address || undefined,
    street: location.complement || undefined,
    city: location.city || undefined,
    country: location.country || undefined,
  };
}

export function truncateAddress(address?: string, parts = 3): string {
  if (!address) return '';
  return address.split(',').slice(0, parts).join(',').trim();
}
