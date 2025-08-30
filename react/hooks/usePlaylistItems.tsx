import { useEffect, useState } from 'react';
import { MOCK_PLAYLISTS } from '@/mocks/mockPlaylists';
import { PlaylistItemsResponse, SpotifyPlaylist, SpotifyTrack, SpotifyTrackWithKey } from '@/types/spotify';
import { getSession } from '../services/session';

// -------------------------------------------------------------------
// Hook with mock-datas (TODO : connect fetch backend when ready)
// -------------------------------------------------------------------
// export function usePlaylistItems(id: string) {
//   const [tracks, setTracks] = useState<SpotifyTrack[] | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);


//   useEffect(() => {
//     let cancelled = false;
//     setLoading(true);
//     setError(null);

//     const fetchPlaylistItems = async (session: any) => {
//       try {
//         return fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/playlists/${id}/tracks`, {
//         method: 'GET',
//         headers: {
//           Authorization: `Bearer ${session?.access_token}`,
//           },
//         })
//         .then(response => {
//           if (!response.ok) {
//             throw new Error('Network response was not ok');
//           }
//           return response.json();
//         });
//       } catch (e) {
//         if (isActive) {
//           setError(`fetch playlists error: ${e}`);
//         }
//       } finally {
//         if (isActive) {
//           setLoading(false);
//         }
//       }
//     };


//   getSession().then((res) => {
//     fetchPlaylistItems(res).then((data) => {
//       if (isActive) {
//         console.log("usePlaylistItems DATA =")
//         console.log(data)
//         console.log("usePlaylistItems DATA.items[0] =")
//         console.log(data.items[0])
//         console.log("usePlaylistItems DATA.items[0].album.images[0] =")
//         console.log(data.items[0].album.images[0])
//         setTracks(data.items || []);
//       }
//     });
//   }).catch((err) => {
//     console.error('Error in usePlaylistItems:', err)
//   });

//   return () => {
//     isActive = false;
//   };
//   }, []);

//   return { tracks, loading, error };
// };


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

        const mapped: SpotifyTrackWithKey[] = (data.items ?? [])
          .map((it, idx) => {
            const t = it?.track;
            if (!t || (t as any).type !== 'track') return null;
            const track = t as SpotifyTrack;
            const addedAt = it.added_at ?? null;

            // Key : id/uri + added_at (+index fallback)
            const base = track.id ?? track.uri ?? 'local';
            const key = `${base}::${addedAt ?? `idx-${idx}`}`;

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
