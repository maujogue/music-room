import { useEffect, useState } from 'react';
import { PlaylistItemsResponse, SpotifyTrack, SpotifyTrackWithKey } from '@/types/spotify';
import { getSession } from '../services/session';


export function usePlaylistItems(id: string) {
  const [tracks, setTracks] = useState<SpotifyTrackWithKey[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const session = await getSession();

        const url = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/playlists/${encodeURIComponent(
          id
        )}/tracks`;

        const res = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${session?.access_token ?? ''}`,
            Accept: 'application/json',
          },
        });

        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`HTTP ${res.status} ${res.statusText} – ${text}`);
        }

        const data: PlaylistItemsResponse = await res.json();

        const fetchStamp = new Date().toISOString();
        const seen = new Map<string, number>();

        const mapped: SpotifyTrackWithKey[] = (data.items ?? [])
          .map((item, idx) => {
            const t = item?.track;
            if (!t || (t as any).type !== 'track') return null;
            const track = t as SpotifyTrack;
            const addedAt = item.added_at ?? fetchStamp;

            // Key : need unique value (id not enough if same track twice in playlist)
            const base = `${track.uri ?? track.id ?? 'local'}::${addedAt}`
            const count = seen.get(base) ?? 0;
            seen.set(base, count + 1);
            const key = count === 0 ? base : `${base}::dup${count}`;

            return { ...track, __key: key, __added_at: addedAt };
          })
          .filter(Boolean) as SpotifyTrackWithKey[];

        if (!cancelled) setTracks(mapped);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { tracks, loading, error };
}
