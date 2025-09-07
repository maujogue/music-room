// Player.js
import React from "react";
import { View, StyleSheet, Text } from "react-native";
import TrackListItem from "@/components/track/TrackListItem";
import PlayerControls from "@/components/player/PlayerControl";

type PlayerProps = {
  track: SpotifyTrack | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
};

const Player = ({ track, isPlaying, onPlayPause, onNext }: PlayerProps) => {
  if (!track) {
    return <View><Text>No track playing</Text></View>;
  }
  return (
    <View style={styles.container}>
      <TrackListItem track={track} />
      <PlayerControls
        isPlaying={isPlaying}
        onPlayPause={onPlayPause}
        onNext={onNext}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
  },
});

export default Player;
