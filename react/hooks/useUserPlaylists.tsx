import { useEffect, useState } from 'react';
import { MOCK_PLAYLISTS } from '@/mocks/mockPlaylists';
import { SpotifyPlaylist } from '@/types/spotify';
import { supabase } from '../services/supabase';


// -------------------------------------------------------------------
// Hook with mock-datas (TODO : fetch backend when ready)
// -------------------------------------------------------------------
export function useUserPlaylists() {
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    setLoading(true);
    setError(null);
    console.log('useUserPlaylists called');

    const fetchPlaylists = async (session: any) => {
    try {
      return fetch('http://10.0.2.2:54321/functions/v1/me/playlists', {
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

async function getSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error('Erreur récupération session:', error);
    return null;
  }

  console.log('Session utilisateur:', session?.access_token);
  return session;
}
