import { HStack } from "@/components/ui/hstack";
import TopVoteItem from "@/components/track/votes/TopVoteItem";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";


interface Props {
  topTracks: SpotifyTrackWithKey[]
}



export default function TopVotesTracks({ topTracks }: Props) {

  const slots: Rank[] = [1, 2, 3];

  return (
    <VStack className="w-full">
      <Heading>Next song</Heading>
      <HStack className="w-full gap-2">
        {slots.map((rank, idx) => (
          <TopVoteItem key={rank} rank={rank} track={topTracks[idx]} />
        ))}
      </HStack>
    </VStack>
  );

}
