CREATE OR REPLACE FUNCTION public.get_spotify_token_from_event_owner(p_event_id UUID)
RETURNS TABLE (
    spotify_access_token TEXT,
    spotify_refresh_token TEXT,
    spotify_token_expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
DECLARE
    p_owner_id UUID;
BEGIN
    -- Récupère l'ID du propriétaire de l'événement
    SELECT owner_id
    INTO p_owner_id
    FROM public.events
    WHERE id = p_event_id;
    IF NOT FOUND THEN
        RETURN; -- événement non trouvé
    END IF;
    -- Récupère le token Spotify et sa date d'expiration pour le propriétaire de l'événement
    RETURN QUERY
    SELECT p.spotify_access_token, p.spotify_refresh_token, p.spotify_token_expires_at
    FROM public.profiles p
    WHERE p.id = p_owner_id;
END;
$$;