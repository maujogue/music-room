import { useMemo, useState, useRef, useEffect } from 'react';
import MapView from 'react-native-maps';
import ErrorScreen from '@/components/generics/screens/ErrorScreen';
import LoadingSpinner from '@/components/generics/screens/LoadingSpinner';
import { useCurrentPosition } from '@/hooks/useCurrentPosition';
import { useEventsRadar } from '@/hooks/useEventsRadar';
import EventMarker from '@/components/events/EventMarker';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Button, ButtonText } from '@/components/ui/button';
import { Box } from '@/components/ui/box';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import EventDatesInfos from './eventDetail/Dates/EventDatesInfos';
import { Badge, BadgeIcon, BadgeText } from '@/components/ui/badge';
import { Footprints, ShellIcon, Navigation, X } from 'lucide-react-native';
import { Heading } from '@/components/ui/heading';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import EventAllBadges from '@/components/generics/EventAllBadges';
import { addUserToEvent } from '@/services/events';
import { useProfile } from '@/contexts/profileCtx';
import { useAppToast } from '@/hooks/useAppToast';
import { useUserEvents } from '@/hooks/useUserEvents';

type RadarProps = {
  radiusKm?: number;
  events?: MusicEventFetchResult[];
};

export default function EventRadarmap({ radiusKm = 50 }: RadarProps) {
  const { coords, loading, error, region } = useCurrentPosition({ radiusKm });
  const mapRef = useRef<MapView>(null);
  const { profile } = useProfile();
  const toast = useAppToast();
  const [joining, setJoining] = useState(false);
  const { events: userEvents, loading: userEventsLoading } = useUserEvents();

  const {
    events,
    loading: radarLoading,
    error: radarError,
  } = useEventsRadar(coords);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedItem = useMemo(
    () => events.find(e => e.event.id === selectedId) ?? null,
    [events, selectedId]
  );

  const isJoined = useMemo(() => {
    if (!selectedId || !userEvents) return false;
    return userEvents.some(ue => ue.event.id === selectedId);
  }, [selectedId, userEvents]);

  function select(id: string) {
    console.log('Selecting : ', id);
    setSelectedId(id);
  }

  function clearSelection() {
    setSelectedId(null);
  }

  function displayDistance(distance: number) {
    if (distance < 1000) {
      return `~ ${distance.toFixed(1)} m`;
    } else {
      return `~ ${(distance / 1000).toFixed(1)} km`;
    }
  }

  function centerOnUser() {
    if (coords && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: coords.lat,
          longitude: coords.long,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        500
      );
    }
  }

  useEffect(() => {
    if (region && mapRef.current) {
      mapRef.current.animateToRegion(region, 500);
    }
  }, [region]);

  async function handleJoinEvent() {
    if (!selectedItem || !profile) return;

    if (isJoined) {
      router.push(`/events/${selectedItem.event.id}`);
      return;
    }

    setJoining(true);
    try {
      await addUserToEvent(selectedItem.event.id, profile.id, 'collaborator');
      toast.success({
        title: 'Joined Event',
        description: `You have successfully joined ${selectedItem.event.name} as a collaborator!`,
      });
      router.push(`/events/${selectedItem.event.id}`);
    } catch (e) {
      console.error('Failed to join event', e);
      toast.error({
        title: 'Error',
        description: 'Failed to join the event. Please try again.',
      });
    } finally {
      setJoining(false);
    }
  }

  if (loading) {
    return <LoadingSpinner text={'Loading position'} />;
  }
  if (radarLoading) {
    return <LoadingSpinner text={'Loading nearby events'} />;
  }
  if (error) {
    return <ErrorScreen error={error} />;
  }
  if (radarError) {
    return <ErrorScreen error={error} />;
  }

  return (
    <VStack className='h-full w-full'>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={
          region ?? {
            latitude: 45.7874,
            longitude: 4.7469,
            latitudeDelta: 1.8,
            longitudeDelta: 2.7,
          }
        }
        showsUserLocation
        showsMyLocationButton
        onPress={clearSelection}
      >
        {events.map(item => (
          <EventMarker
            key={item.event.id}
            item={item}
            selected={item.event.id === selectedId}
            onPress={select}
          />
        ))}
      </MapView>

      {/* EVENT INFOS */}
      {selectedItem && (
        <Box className='absolute inset-x-3 bottom-3 z-50'>
          <Box className='bg-neutral-300/50 rounded-xl border border-neutral-300 p-0.5'>
            <VStack className='relative'>
              {selectedItem.event.image_url ? (
                <Image
                  source={{ uri: selectedItem.event.image_url }}
                  className='w-full h-[150px] rounded-lg'
                  alt='Event image'
                />
              ) : (
                <Box className='w-full h-[150px] rounded-lg bg-neutral-100 items-center justify-center'>
                  <Text size='xs' className='text-neutral-500'>
                    No img
                  </Text>
                </Box>
              )}
              <LinearGradient
                colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.1)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1.4, y: 0 }}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                }}
              />

              {selectedItem.event.everyone_can_vote && (
                <HStack className='absolute bottom-2 right-2 gap-1'>
                  <EventAllBadges event={selectedItem.event} />
                </HStack>
              )}
            </VStack>

            <VStack className='bg-white/50 rounded-b-xl border border-neutral-300 w-full pt-2 px-2'>
              <HStack className='w-full justify-between'>
                <Heading size='lg' className='text-neutral-950 font-semibold'>
                  {' '}
                  {selectedItem.event.name}{' '}
                </Heading>
                <Badge size='md' className='rounded-xl h-6'>
                  <BadgeIcon as={ShellIcon} size='lg' />
                  <BadgeText
                    className='pl-1 font-bold'
                    ellipsizeMode='tail'
                    style={{ maxWidth: 200 }}
                  >
                    {selectedItem.radar.venuename}
                  </BadgeText>
                </Badge>
              </HStack>
              <Text size='sm' className='text-neutral-600' numberOfLines={3}>
                {selectedItem.event.description}
              </Text>
              <HStack className='items-center px-2'>
                <Avatar size='sm'>
                  <AvatarImage
                    source={{
                      uri: selectedItem.owner?.avatar_url
                        ? selectedItem.owner.avatar_url
                        : 'https://picsum.photos/111',
                    }}
                  />
                </Avatar>
                <Text size='sm' className='text-typography-400 px-2'>
                  {selectedItem.owner?.username}
                </Text>
              </HStack>
              <HStack className='w-full my-3 items-center justify-between'>
                {!!selectedItem.radar?.dist && (
                  <Badge size='md' className='rounded-xl h-6'>
                    <BadgeIcon as={Footprints} size='lg' />
                    <BadgeText
                      className='pl-1 font-bold'
                      ellipsizeMode='tail'
                      style={{ maxWidth: 200 }}
                    >
                      {displayDistance(selectedItem.radar.dist)}
                    </BadgeText>
                  </Badge>
                )}

                <EventDatesInfos
                  event={selectedItem.event}
                  coordinates={selectedItem.radar.coordinates}
                />

                <Button
                  size='sm'
                  action='primary'
                  onPress={handleJoinEvent}
                  isDisabled={joining || userEventsLoading}
                >
                  <ButtonText>
                    {joining
                      ? 'Joining...'
                      : userEventsLoading
                        ? 'Checking...'
                        : isJoined
                          ? 'Go'
                          : 'Join'}
                  </ButtonText>
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}
    </VStack>
  );
}
