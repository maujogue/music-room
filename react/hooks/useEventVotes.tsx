import { useCallback, useEffect, useState } from 'react';
import { getErrorMsg } from '@/utils/getErrorMsg';
import { getVotesEventById } from '@/services/events';
import { MOCK_VOTES } from '@/mocks/mockEvents';

export function useEventVotes(eventId: string) {
  const [votes, setEventVotes] = useState<EventVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------------------------
  // Fetch event votes (GET)
  // ---------------------------------------------------------------
  const fetchVotes = useCallback(async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      setError(null);

      // const data = [] as EventVote[];
      const data = MOCK_VOTES;
      // [!] TODO : Remove Mock data + uncomment above to link backend
      // const data = await getVotesEventById(eventId);
      setEventVotes(data);
    } catch (err) {
      setError(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchVotes();
  }, [fetchVotes]);

  const refetch = useCallback(() => {
    fetchVotes();
  }, [fetchVotes]);

  return { votes, loading, error, refetch };
}
