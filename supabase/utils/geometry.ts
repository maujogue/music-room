type Coordinates = { lat: number; long: number };

export function geometryToCoordinates(
  geom: string | null | undefined,
): Coordinates | null {
  if (!geom) return null;
  const cleaned = geom.replace(/^SRID=\d+;/, "").trim();

  const match = cleaned.match(/^POINT\(([-\d\.]+)\s+([-\d\.]+)\)$/);
  if (!match) {
    console.warn("Unexpected geometry format:", geom);
    return null;
  }

  const long = parseFloat(match[1]);
  const lat = parseFloat(match[2]);

  return { lat, long };
}
