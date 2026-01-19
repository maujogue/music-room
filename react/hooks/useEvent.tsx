import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMsg } from '@/utils/getErrorMsg';
import {
  deleteEventById,
  getEventById,
  startEvent as startEventService,
  stopEvent as stopEventService,
  updateEvent as updateEventService,
} from '@/services/events';

export function useEvent(id: string) {
  const queryClient = useQueryClient();
  const queryKey = ['event', id];

  // ---------------------------------------------------------------
  // Fetch event (GET)
  // ---------------------------------------------------------------
  const {
    data,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => getEventById(id),
    enabled: !!id,
  });

  // ---------------------------------------------------------------
  // Remove Event (DELETE)
  // ---------------------------------------------------------------
  const deleteMutation = useMutation({
    mutationFn: () => deleteEventById(id),
    onSuccess: () => {
      // Invalidate the event query (though it's deleted, so maybe just clear it or invalidate list)
      queryClient.setQueryData(queryKey, null);
      // Also invalidate list of events if possible, e.g. queryClient.invalidateQueries({ queryKey: ['events'] })
      // For now, at least clear this specific one.
    },
  });

  const deleteEvent = async () => {
    try {
      await deleteMutation.mutateAsync();
    } catch (e) {
      console.error('Delete Event error:', e);
      // Error is handled by mutation state if needed, but keeping original API return void for now
    }
  };

  // ---------------------------------------------------------------
  // Update Event (PUT)
  // ---------------------------------------------------------------
  const updateMutation = useMutation({
    mutationFn: (payload: MusicEventPayload) => updateEventService(id, payload),
    onSuccess: updatedData => {
      queryClient.setQueryData(queryKey, updatedData);
    },
  });

  const handleUpdateEvent = async (payload: MusicEventPayload) => {
    if (!id) throw new Error('Event ID is required for update');
    try {
      await updateMutation.mutateAsync(payload);
    } catch (e) {
      console.error('Update Event error:', e);
      throw e;
    }
  };

  // ---------------------------------------------------------------
  // Start Event
  // ---------------------------------------------------------------
  const startMutation = useMutation({
    mutationFn: () => startEventService(id),
    onSuccess: () => {
      // Re-fetch to get updated status
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const handleStartEvent = async (id: string) => {
    if (!id) throw new Error('Event ID is required for start');
    try {
      await startMutation.mutateAsync();
    } catch (e) {
      console.error('Start event error:', e);
      throw e;
    }
  };

  // ---------------------------------------------------------------
  // Stop Event
  // ---------------------------------------------------------------
  const stopMutation = useMutation({
    mutationFn: () => stopEventService(id),
    onSuccess: () => {
      // Re-fetch to get updated status
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const handleStopEvent = async (id: string) => {
    if (!id) throw new Error('Event ID is required for stop');
    try {
      await stopMutation.mutateAsync();
    } catch (e) {
      console.error('Stop event error:', e);
      throw e;
    }
  };

  // Combine errors
  const combinedError = error
    ? getErrorMsg(error)
    : deleteMutation.error
      ? getErrorMsg(deleteMutation.error)
      : updateMutation.error
        ? getErrorMsg(updateMutation.error)
        : startMutation.error
          ? getErrorMsg(startMutation.error)
          : stopMutation.error
            ? getErrorMsg(stopMutation.error)
            : null;

  return {
    data: data ?? null,
    loading:
      loading ||
      deleteMutation.isPending ||
      updateMutation.isPending ||
      startMutation.isPending ||
      stopMutation.isPending,
    error: combinedError,
    // Maintaining API compatibility mostly, though setters are gone
    setError: () => {}, // No-op, managed by Query
    refetch,
    deleteEvent,
    updateEvent: handleUpdateEvent,
    startEvent: handleStartEvent,
    stopEvent: handleStopEvent,
  };
}
