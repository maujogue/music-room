import { useEffect, useState } from 'react';
import { PlaylistItemsResponse, SpotifyTrack, SpotifyTrackWithKey } from '@/types/spotify';


export function usePlaylistItems(id: string, data: PlaylistItemsResponse) {
  const [tracks, setTracks] = useState<SpotifyTrackWithKey[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);
      if (!data || !data.items) {
        return;
      }

      try {
        const fetchStamp = new Date().toISOString();
        const seen = new Map<string, number>();

        const mapped: SpotifyTrackWithKey[] = (data.items ?? [])
          .map((item) => {
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
  }, [id, data]);

  return { tracks, loading, error };
}
