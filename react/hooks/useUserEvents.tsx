import { useEffect, useState, useCallback } from 'react';
import { getSession } from '@/services/session';
import { getCurrentUserEvents } from '@/services/events';

export function useUserEvents() {
  const [events, setEvents] = useState<Event[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const session = await getSession();
      if (!session) throw new Error('Session retrieve error');
      const data = await getCurrentUserEvents();
      setEvents(data || []);
    } catch (e) {
      console.error('Error fetching events:', e);
      setError('fetch events error');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    fetchEvents();
  }, []);

  return { events, refetch, loading, error };
}
