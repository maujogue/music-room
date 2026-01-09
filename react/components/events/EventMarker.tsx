import { Marker } from 'react-native-maps';
import starPng from '@/assets/star.png';
import starEmptyPng from '@/assets/starEmpty.png';

type Props = {
  item: MusicEventRadarResult;
  selected?: boolean;
  onPress?: (id: string) => void;
};

export default function EventMarkerBase({ item, selected, onPress }: Props) {
  if (!item.radar.coordinates) return null;
  const coord = item.radar.coordinates;

  return (
    <Marker
      coordinate={{ latitude: coord.lat, longitude: coord.long }}
      image={selected ? starPng : starEmptyPng}
      onPress={() => onPress?.(item.event.id)}
    ></Marker>
  );
}
