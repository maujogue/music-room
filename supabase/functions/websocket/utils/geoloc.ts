type Coordinates = { lat: number; long: number };

/** Distance en mètres entre deux points (Haversine) */
export function distanceMeters(a: Coordinates, b: Coordinates): number {
  if (!a || !b || !a.lat || !a.long || !b.lat || !b.long) return 123456789;
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;

  const φ1 = toRad(a.lat);
  const φ2 = toRad(b.lat);
  const Δφ = toRad(b.lat - a.lat);
  const Δλ = toRad(b.long - a.long);

  const sinΔφ = Math.sin(Δφ / 2);
  const sinΔλ = Math.sin(Δλ / 2);

  const h = sinΔφ * sinΔφ +
    Math.cos(φ1) * Math.cos(φ2) * sinΔλ * sinΔλ;

  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}
