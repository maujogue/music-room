// PlayerControls.js
import React from 'react';
import { Box } from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

const PlayerControls = ({ isPlaying, onPlayPause, onNext }) => (
  <Box>
    <Button onPress={onPlayPause} className='rounded-full p-3.5'>
      {isPlaying ? (
        <FontAwesome6 name='play' size={10} color='white' />
      ) : (
        <FontAwesome5 name='pause' size={10} color='white' />
      )}
    </Button>
    <Button onPress={onNext} className='rounded-full p-3.5'>
      <AntDesign name='stepforward' size={10} color='white' />
    </Button>
  </Box>
);

export default PlayerControls;
