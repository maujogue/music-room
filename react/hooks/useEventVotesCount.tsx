import { useMemo } from "react";
import { useEventVotes } from "@/hooks/useEventVotes";

export function useVoteCountIndex(eventId: string) {
  const { votes, loading, error, refetch } = useEventVotes(eventId);

  const voteCountByTrack = useMemo(() => {
    const map = new Map<string, number>();
    if (!votes) return map;

    for (const v of votes) {
      if (!v.trackId) continue;
      const n = typeof v.number === "number" ? v.number : (v.users?.length ?? 0);
      map.set(v.trackId, (map.get(v.trackId) ?? 0) + n);
    }
    return map;
  }, [votes]);

  const getVoteCount = (trackId: string) => voteCountByTrack.get(trackId) ?? 0;

  // const getTopTracks = (limit: number = 3) => {
  //   return Array.from(voteCountByTrack.entries())
  //     .map(([trackId, count]) => ({ trackId, count }))
  //     .sort((a, b) => b.count - a.count)
  //     .slice(0, limit);
  // };

  const getTrackId = (track: SpotifyTrackWithKey) => { return track?.id ?? "localTrackId" }

  const getTopTracksFrom = (
    tracks: SpotifyTrackWithKey[],
    limit: number = 3
  ): SpotifyTrackWithKey[] => {
    if (!Array.isArray(tracks) || tracks.length === 0) return [];

    const orderIndex = new Map<string, number>(tracks.map((t, i) => [getTrackId(t), i]));

    const sorted = [...tracks].sort((a, b) => {
      const va = getVoteCount(getTrackId(a));
      const vb = getVoteCount(getTrackId(b));
      if (vb !== va) return vb - va;
      const byName = (a.name ?? "").localeCompare(b.name ?? "");
      if (byName !== 0) return byName;
      return (orderIndex.get(getTrackId(a)) ?? 0) - (orderIndex.get(getTrackId(b)) ?? 0);
    });

    return sorted.slice(0, limit);
  };

  return {
    voteCountByTrack,
    getTrackId,
    getVoteCount,
    getTopTracksFrom,
    // getTopTracks,
    loading,
    error,
    refetch,
  };
}
