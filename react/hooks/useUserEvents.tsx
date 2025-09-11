import { useEffect, useState } from 'react';
import { getSession } from '@/services/session';
import { Session } from '@/types/session';
import { MOCK_EVENTS } from '@/mocks/mockEvents';

export function useUserEvents() {
  const [events, setEvents] = useState<MusicEvent[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    setLoading(true);
    setError(null);
    console.log('useUserEvents called');

    const fetchPlaylists = async (session: Session) => {
      try {
        return fetch(
          `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/me/events`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${session?.access_token}`,
            },
          }
        ).then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        });
      } catch (e) {
        console.error('Error fetching events:', e);
        if (isActive) {
          setError('fetch playlists error');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    getSession()
      .then(res => {
        if (res == null) throw new Error('Session retrieve error');

        // MOCK-DATA OVERRIDE HERE
        // -----------------------
        if (isActive) {
          setEvents(MOCK_EVENTS);
          setLoading(false);
          return;
        }
        // -----------------------

        fetchPlaylists(res).then(data => {
          if (isActive) {
            // [!] Note to backend : decide foramt response (wrap in .items or whatever)
            setEvents(data.items || []);
          }
        });
      })
      .catch(err => {
        console.error('Erreur dans useUserPlaylists:', err);
      });

    return () => {
      isActive = false;
    };
  }, []);

  return { events, loading, error };
}
