import { useEffect, useState } from 'react';
import { SpotifyPlaylist } from '@/types/spotify';
import { getSession } from '@/services/session';
import { Session } from '@/types/session';


export function useUserPlaylists() {
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    setLoading(true);
    setError(null);
    console.log('useUserPlaylists called');

    const fetchPlaylists = async (session: Session) => {
    try {
      return fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/me/playlists`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      });
    } catch (e) {
      console.error('Error fetching playlists:', e);
      if (isActive) {
        setError('fetch playlists error');
      }
    } finally {
      if (isActive) {
        setLoading(false);
      }
    }
  };

  getSession().then((res) => {
    if (res == null)
      throw new Error("Session retrieve error")
    fetchPlaylists(res).then((data) => {
      if (isActive) {
        setPlaylists(data.items || []);
      }
    });
  }).catch((err) => {
    console.error('Erreur dans useUserPlaylists:', err)
  });

  return () => {
    isActive = false;
  };
  }, []);

  return { playlists, loading, error };
};


