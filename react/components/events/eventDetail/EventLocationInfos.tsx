import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Badge, BadgeIcon, BadgeText } from '@/components/ui/badge';
import { MapPinIcon, ShellIcon } from 'lucide-react-native';

type Props = {
  location: MusicEventLocation;
};

export default function EventLocationInfo({ location }: Props) {
  const {
    coordinates,
    venueName,
    address,
    city,
    country,
  } = location;

  if (
    !coordinates &&
    !venueName &&
    !address &&
    !city &&
    !country
  ) {
    return null;
  }

  return (
    <VStack className="gap-2">

      {venueName && (
        <Badge size="md" action="info" className="rounded-xl h-6">
          <BadgeIcon as={ShellIcon} size="lg" />
          <BadgeText className="pl-1 font-bold">{venueName}</BadgeText>
        </Badge>
      )}

      {(address || city || country) && (
        <VStack className="ml-1 text-secondary-700">
          {address && <Text size="xs" className="text-secondary-700">{address}</Text>}
          <HStack className="items-center gap-1">
            {city && <Text className="text-secondary-700">{city}</Text>}
            {city && country && <Text className="text-secondary-700">, </Text>}
            {country && <Text className="text-secondary-700">{country}</Text>}
          </HStack>
        </VStack>
      )}

      {coordinates && (
        <Badge size="md" action="muted" className="rounded-md bg-indigo-200 h-6">
          <BadgeIcon as={MapPinIcon} size="lg" />
          <BadgeText className="pl-1">{coordinates.lat.toFixed(5)}, {coordinates.long.toFixed(5)}</BadgeText>
        </Badge>
      )}
    </VStack>
  );
}
