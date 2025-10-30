import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Badge, BadgeIcon, BadgeText } from '@/components/ui/badge';
import { ShellIcon } from 'lucide-react-native';
import {
  truncateAddress,
} from '@/utils/parsePointCoordinates';

type Props = {
  location?: MusicEventLocation;
};

export default function EventLocationInfo({ location }: Props) {
  if (!location) {
    return null;
  }

  const { coordinates, venuename, address, city, country } = location;

  if (!coordinates && !venuename && !address && !city && !country) {
    return null;
  }

  return (
    <VStack className='gap-2'>
      {venuename && (
        <Badge size='md' className='rounded-xl h-6'>
          <BadgeIcon as={ShellIcon} size='lg' />
          <BadgeText
            className='pl-1 font-bold'
            ellipsizeMode='tail'
            style={{ maxWidth: 200 }}
          >
            {venuename}
          </BadgeText>
        </Badge>
      )}

      {(address || city || country) && (
        <VStack className='ml-1 text-secondary-700'>
          {address && (
            <Text
              size='xs'
              className='text-secondary-700'
              numberOfLines={1}
              ellipsizeMode='tail'
              style={{ maxWidth: 200 }}
            >
              {truncateAddress(address)}
            </Text>
          )}
          {city && country && (
            <Text
              className='text-secondary-700'
              ellipsizeMode='tail'
              numberOfLines={1}
              style={{ maxWidth: 200 }}
            >
              {' '}
              {city} | {country}
            </Text>
          )}
          {city && !country && (
            <Text
              className='text-secondary-700'
              ellipsizeMode='tail'
              numberOfLines={1}
              style={{ maxWidth: 200 }}
            >
              {city}
            </Text>
          )}
        </VStack>
      )}
    </VStack>
  );
}
