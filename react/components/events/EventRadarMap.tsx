import { useMemo, useState, useRef, useEffect } from 'react';
import MapView from 'react-native-maps';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { View, Pressable, Platform } from 'react-native';
import ErrorScreen from '@/components/generics/screens/ErrorScreen';
import LoadingSpinner from '@/components/generics/screens/LoadingSpinner';
import { useCurrentPosition } from '@/hooks/useCurrentPosition';
import { useEventsRadar } from '@/hooks/useEventsRadar';
import EventMarker from '@/components/events/EventMarker';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Button, ButtonText } from '@/components/ui/button';
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

  function select(id: string) {
    setSelectedId(id);
    const item = events.find(e => e.event.id === id);

    if (item && item.radar.coordinates && mapRef.current) {
      // Animate to the marker, slightly offset so it appears above the bottom sheet
      const { lat, long } = item.radar.coordinates;
      mapRef.current.animateToRegion(
        {
          latitude: lat - 0.002, // slight offset to show pin above sheet
          longitude: long,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        },
        500
      );
    }
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
    <View className='flex-1 w-full relative bg-neutral-100'>
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
        showsMyLocationButton={false}
        onPress={clearSelection}
        toolbarEnabled={false}
        moveOnMarkerPress={false}
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

      {/* Custom User Location Button */}
      <Pressable
        onPress={centerOnUser}
        className='absolute top-4 right-4 bg-white p-3 rounded-xl shadow-md border border-neutral-200 active:bg-neutral-100'
        style={{ elevation: 5 }}
      >
        <Navigation
          size={24}
          color='#007AFF'
          fill={coords ? '#007AFF' : 'transparent'}
        />
      </Pressable>

      {/* Bottom Sheet Card */}
      {selectedItem && (
        <Animated.View
          entering={SlideInDown.springify().damping(15)}
          exiting={SlideOutDown.duration(200)}
          className='absolute bottom-6 left-4 right-4'
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 5,
            elevation: 10,
          }}
        >
          <View className='bg-white rounded-2xl overflow-hidden'>
            {/* Image Header */}
            <View className='h-40 w-full relative bg-neutral-100'>
              {selectedItem.event.image_url ? (
                <Image
                  source={{ uri: selectedItem.event.image_url }}
                  className='w-full h-full'
                  alt='Event image'
                  resizeMode='cover'
                />
              ) : (
                <View className='w-full h-full items-center justify-center'>
                  <Text className='text-neutral-400'>No Image</Text>
                </View>
              )}

              <LinearGradient
                colors={['rgba(0,0,0,0.6)', 'transparent']}
                start={{ x: 0, y: 1 }}
                end={{ x: 0, y: 0.5 }}
                className='absolute inset-0'
              />

              <Pressable
                onPress={clearSelection}
                className='absolute top-2 right-2 bg-black/30 p-1.5 rounded-full backdrop-blur-md'
              >
                <X size={16} color='white' />
              </Pressable>

              {selectedItem.event.everyone_can_vote && (
                <View className='absolute bottom-2 right-2'>
                  <EventAllBadges event={selectedItem.event} />
                </View>
              )}
            </View>

            {/* Content */}
            <VStack className='p-4 space-y-3'>
              <HStack className='justify-between items-start'>
                <VStack className='flex-1 pr-2'>
                  <Heading
                    size='md'
                    className='text-neutral-900 font-bold'
                    numberOfLines={1}
                  >
                    {selectedItem.event.name}
                  </Heading>
                  <HStack className='items-center mt-1 space-x-1'>
                    <ShellIcon size={14} className='text-neutral-500' />
                    <Text
                      size='sm'
                      className='text-neutral-500 font-medium'
                      numberOfLines={1}
                    >
                      {selectedItem.radar.venuename || 'Unknown Venue'}
                    </Text>
                    <Text size='sm' className='text-neutral-300 mx-1'>
                      •
                    </Text>
                    <Text size='sm' className='text-neutral-500'>
                      {displayDistance(selectedItem.radar.dist)}
                    </Text>
                  </HStack>
                </VStack>

                <View className='bg-primary-50 px-2 py-1 rounded-lg'>
                  <EventDatesInfos
                    event={selectedItem.event}
                    coordinates={selectedItem.radar.coordinates}
                    minimal
                  />
                </View>
              </HStack>

              <Text
                size='sm'
                className='text-neutral-600 leading-5'
                numberOfLines={2}
              >
                {selectedItem.event.description}
              </Text>

              <HStack className='items-center justify-between pt-2 mt-2 border-t border-neutral-100'>
                <HStack className='items-center space-x-2'>
                  <Avatar size='sm'>
                    <AvatarImage
                      source={{
                        uri:
                          selectedItem.owner?.avatar_url ||
                          'https://picsum.photos/111',
                      }}
                    />
                  </Avatar>
                  <Text size='sm' className='font-medium text-neutral-700'>
                    {selectedItem.owner?.username}
                  </Text>
                </HStack>

                <Button
                  size='sm'
                  action='primary'
                  className='rounded-full px-5'
                  onPress={handleJoinEvent}
                  isDisabled={joining}
                >
                  <ButtonText>{joining ? 'Joining...' : 'Join'}</ButtonText>
                </Button>
              </HStack>
            </VStack>
          </View>
        </Animated.View>
      )}
    </View>
  );
}
