// PlayerControls.js
import React from "react";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon} from "@/components/ui/button";
import { ChevronsRightIcon } from "@/components/ui/icon";

const PlayerControls = ({ isPlaying, onPlayPause, onNext }) => (
  <Box>
    <Button onPress={onPlayPause} variant="ghost" size="lg" shape="circle">
      <ButtonIcon icon={isPlaying ? "PauseIcon" : "PlayIcon"} size={24} />
    </Button>
    <Button onPress={onNext} variant="ghost" size="lg" shape="circle">
      <ButtonIcon icon={ChevronsRightIcon} size={24} />
    </Button>
  </Box>
);


export default PlayerControls;
