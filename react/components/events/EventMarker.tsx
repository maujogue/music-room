import { Marker } from 'react-native-maps';
import { View } from 'react-native';
import { Music } from 'lucide-react-native';
import { useState, useEffect } from 'react';

type Props = {
  item: MusicEventRadarResult;
  selected?: boolean;
  onPress?: (id: string) => void;
};

export default function EventMarker({ item, selected, onPress }: Props) {
  const [tracksView, setTracksView] = useState(true);

  useEffect(() => {
    setTracksView(true);
    const timer = setTimeout(() => setTracksView(false), 500);
    return () => clearTimeout(timer);
  }, [selected]);

  if (!item.radar.coordinates) return null;
  const coord = item.radar.coordinates;

  return (
    <Marker
      coordinate={{ latitude: coord.lat, longitude: coord.long }}
      onPress={e => {
        e.stopPropagation();
        onPress?.(item.event.id);
      }}
      tracksViewChanges={tracksView}
    >
      <View
        className={`items-center justify-center h-10 w-10 rounded-full shadow-sm border border-neutral-200 ${
          selected ? 'bg-primary-500 scale-110' : 'bg-white'
        }`}
      >
        <Music size={20} color={selected ? 'white' : '#ec4899'} />
      </View>
    </Marker>
  );
}
