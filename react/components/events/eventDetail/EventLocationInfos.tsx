import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Badge, BadgeIcon, BadgeText } from '@/components/ui/badge';
import { MapPinIcon, ShellIcon } from 'lucide-react-native';
import { parsePointCoordinates } from '@/utils/parsePointCoordinates';

type Props = {
  location?: MusicEventLocation;
};

export default function EventLocationInfo({ location }: Props) {
  if (!location) { return null; }

  const {
    coordinates,
    venuename,
    address,
    city,
    country,
  } = location;

  if (
    !coordinates &&
    !venuename &&
    !address &&
    !city &&
    !country
  ) {
    return null;
  }

  const parsedCoordinates = coordinates
    ? parsePointCoordinates(coordinates)
    : null;

  return (
    <VStack className="gap-2">

      {venuename && (
        <Badge size="md" action="info" className="rounded-xl h-6">
          <BadgeIcon as={ShellIcon} size="lg" />
          <BadgeText className="pl-1 font-bold">{venuename}</BadgeText>
        </Badge>
      )}

      {(address || city || country) && (
        <VStack className='ml-1 text-secondary-700'>
          {address && (
            <Text size='xs' className='text-secondary-700'>
              {address}
            </Text>
          )}
          <HStack className='items-center gap-1'>
            {city && <Text className='text-secondary-700'>{city}</Text>}
            {city && country && <Text className='text-secondary-700'>, </Text>}
            {country && <Text className='text-secondary-700'>{country}</Text>}
          </HStack>
        </VStack>
      )}

      {parsedCoordinates && (
        <Badge
          size='md'
          action='muted'
          className='rounded-md bg-indigo-200 h-6'
        >
          <BadgeIcon as={MapPinIcon} size='lg' />
          <BadgeText className='pl-1'>
            {parsedCoordinates.y.toFixed(5)}, {parsedCoordinates.x.toFixed(5)}
          </BadgeText>
        </Badge>
      )}
    </VStack>
  );
}
