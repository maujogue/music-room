import { useCallback, useEffect, useState } from 'react';
import { getErrorMsg } from '@/utils/getErrorMsg';
import { deleteEventById, getEventById } from '@/services/events';

export function useEvent(id: string) {
  const [data, setData] = useState<MusicEventFetchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------------------------
  // Fetch event (GET)
  // ---------------------------------------------------------------
  const fetchEvent = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getEventById(id);
      setData(data);
    } catch (err) {
      setError(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const refetch = useCallback(() => {
    fetchEvent();
  }, [fetchEvent]);

  // ---------------------------------------------------------------
  // Remove Event (DELETE)
  // ---------------------------------------------------------------
  const deleteEvent = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await deleteEventById(id);
      setData(null);
    } catch (e: any) {
      setError(`delete Event error: ${e.message ?? e}`);
      console.error('Delete Event error:', e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  return { data, loading, error, setError, refetch, deleteEvent };
}
