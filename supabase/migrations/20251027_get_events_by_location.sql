-- Migration: Fonction pour récupérer les events par localisation
-- Crée la fonction get_events_by_location(long, lat, range_km)

CREATE OR REPLACE FUNCTION get_events_by_location(
  p_long DOUBLE PRECISION,
  p_lat DOUBLE PRECISION,
  p_range_km DOUBLE PRECISION
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  res JSON;
BEGIN
  SELECT COALESCE(json_agg(get_complete_event(e.id)), '[]'::json) INTO res
  FROM events e
  JOIN location l ON l.event_id = e.id
  WHERE l.coordinates IS NOT NULL
    AND earth_distance(
      ll_to_earth(p_lat, p_long),
      ll_to_earth(l.coordinates[1], l.coordinates[0])
    ) <= p_range_km * 1000;
  RETURN res;
END;
$$;

-- Extension earthdistance et cube requise
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;
