import { memo } from 'react';
import { Marker, Callout } from 'react-native-maps';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Image } from '@/components/ui/image';


type Props = {
  item: MusicEventRadarResult;
  selected?: boolean;
  onPress?: (id: string) => void;
};

function EventMarkerBase({ item, selected, onPress }: Props) {
  if (!item.radar.coordinates) return null;
  const coord = item.radar.coordinates

  const cover = item.event.image_url;
  // const subtitle =
  //   item.location.venuename ??
  //   item.location.address ??
  //   [item.location.city, item.location.country].filter(Boolean).join(', ');

  return (
    <Marker
      coordinate={{latitude: coord.lat, longitude: coord.long}}
      onPress={() => onPress?.(item.event.id)}
      pinColor={selected ? '#007AFF' : undefined}
      tracksViewChanges={false}
    >
      {/* Pin custom gluestack */}
      <HStack
        className={[
          'items-center rounded-2xl border px-3 py-1.5',
          selected
            ? 'bg-primary-600/90 border-primary-300/40'
            : 'bg-black/75 border-white/20',
        ].join(' ')}
        space="sm"
      >
        {cover ? (
          <Image
            source={{ uri: cover }}
            alt="cover"
            className="w-4 h-4 rounded-sm bg-neutral-800"
          />
        ) : (
          <Box className="w-2.5 h-2.5 rounded-full bg-white" />
        )}
        <Text size="xs" className="text-white max-w-[140px]" numberOfLines={1}>
          {item.event.name}
        </Text>
      </HStack>

      <Callout tooltip>
        <Box className="max-w-[260px] rounded-2xl border border-neutral-200 bg-white p-3">
          <Text size="md" className="font-semibold text-neutral-900">
            {item.event.name}
          </Text>
          {!!item.event.beginning_at && (
            <Text size="xs" className="text-neutral-500 mt-1">
              {new Date(item.event.beginning_at).toLocaleString()}
            </Text>
          )}
        </Box>
      </Callout>
    </Marker>
  );
}

export const EventMarker = memo(EventMarkerBase);
