import { useCallback, useEffect, useState } from 'react';
import { getErrorMsg } from '@/utils/getErrorMsg';
import { deleteEventById, getEventById, startEvent, stopEvent, updateEvent,  } from '@/services/events';

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

  const handleUpdateEvent = useCallback(
    async (payload: MusicEventPayload) => {
      if (!id) {
        setError('Event ID is required for update');
        return;
      }
      setLoading(true);
      setError(null);

      try {
        await updateEvent(id, payload);
        refetch();
      } catch (e: any) {
        setError(`Update Event error: ${e.message ?? e}`);
        console.error('Update Event error:', e);
        throw Error(e);
      } finally {
        setLoading(false);
      }
    },
    [id]
  );

  const handleStartEvent = useCallback(
    async (id: string) => {
      if (!id) {
        setError('Event ID is required for start');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        await startEvent(id);
      } catch (e: any) {
        setError(`Start event error: ${e.message ?? e}`);
        console.error('Start event error:', e);
        throw Error(e);
      } finally {
        setLoading(false);
      }
    },
    [id]
  );

  const handleStopEvent = useCallback(
    async (id: string) => {
      if (!id) {
        setError('Event ID is required for stop');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        await stopEvent(id);
      } catch (e: any) {
        setError(`Stop event error: ${e.message ?? e}`);
        console.error('Stop event error:', e);
        throw Error(e);
      } finally {
        setLoading(false);
      }
    },
    [id]
  );

  return {
    data,
    loading,
    error,
    setError,
    refetch,
    deleteEvent,
    updateEvent: handleUpdateEvent,
    startEvent: handleStartEvent,
    stopEvent: handleStopEvent,
  };
}
