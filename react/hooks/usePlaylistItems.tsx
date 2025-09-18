import { useEffect, useState } from 'react';

export function usePlaylistItems(id: string, data: PlaylistTrack[]) {
  const [tracks, setTracks] = useState<PlaylistTrack[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!data) {
          setTracks([]);
          return;
        }

        // Simulate async operation if needed
        setTracks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setTracks([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id, data]);

  return { tracks, loading, error };
}
