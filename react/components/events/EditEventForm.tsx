import React, { useState } from 'react';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { HStack } from '@/components/ui/hstack';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Box } from '@/components/ui/box';
import { Icon, AlertCircleIcon } from '@/components/ui/icon';
import { Center } from '@/components/ui/center';
import { FormControl } from '@/components/ui/form-control';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { ScrollView, Image } from 'react-native';
import { Pen, Save } from 'lucide-react-native';
import AddPlaylistItem from '@/components/playlist/AddPlaylistItem';
import PlaylistListItem from '@/components/playlist/PlaylistListItem';
import PlaylistSelectionModal from '@/components/playlist/PlaylistSelectionModal';
import DateTimePicker from '@react-native-community/datetimepicker';
import FloatButton from '@/components/generics/FloatButton';
import { Switch } from '@/components/ui/switch';
import { useAppToast } from '@/hooks/useAppToast';
import * as ImagePicker from 'expo-image-picker';
import LocationPickerModal from '@/components/generics/LocationPickerModal';
import { parseLocation } from '@/utils/parsePointCoordinates';
import PrivateBadge from '@/components/generics/PrivateBadge';
import CollaborativeBadge from '@/components/generics/CollaborativeBadge';
import SpatioLicenceBadge from '@/components/generics/SpatioLicenceBadge';
import EventDoneBadge from '@/components/generics/EventDoneBadge';

type Props = {
  onSubmit: (payload: MusicEventPayload) => Promise<void> | void;
  ApiError: string;
  initialValues?: Partial<MusicEventFetchResult>;
};

export default function EditEventForm({
  initialValues = {},
  ApiError,
  onSubmit,
}: Props) {
  const [name, setName] = useState(initialValues.event?.name ?? '');
  const [description, setDescription] = useState(
    initialValues.event?.description ?? ''
  );
  const [imageUrl, setImageUrl] = useState(
    initialValues.event?.image_url ?? ''
  );
  const [playlist, setPlaylist] = useState<Playlist | null>(
    initialValues.playlist ?? null
  );
  const [beginningAt, setBeginningAt] = useState(
    initialValues.event?.beginning_at
      ? new Date(initialValues.event.beginning_at)
      : new Date()
  );
  const [is_private, setIsPrivate] = useState(
    initialValues.event?.is_private ?? false
  );
  const [spatio_licence, setSpatioLicence] = useState(
    initialValues.event?.spatio_licence ?? false
  );
  const [done, setDone] = useState(
    initialValues.event?.done ?? false
  );
  const [everyone_can_vote, setEveryoneCanVote] = useState(
    initialValues.event?.everyone_can_vote ?? true
  );

  // DateTimePicker states
  const [showBeginning, setShowBeginning] = useState(false);
  const [mode, setMode] = useState<'date' | 'time'>('date');

  // location fields
  const initialLocation = parseLocation(initialValues?.location); // TODO : check l'initialisation
  const [isLocationOpen, setLocationOpen] = useState(false);
  const [location, setLocation] = useState<PickedPlace | null>(initialLocation);
  const [venueName, setVenueName] = useState(
    initialValues?.location?.venuename ?? ''
  );
  const [error, setError] = useState<string | null>(null);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const toast = useAppToast();

  // DateTimePicker handlers
  const onBeginningChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || beginningAt;
    setShowBeginning(false);
    setBeginningAt(currentDate);
  };

  const showBeginningMode = (currentMode: 'date' | 'time') => {
    setShowBeginning(true);
    setMode(currentMode);
  };

  const showBeginningDatepicker = () => {
    showBeginningMode('date');
  };

  const showBeginningTimepicker = () => {
    showBeginningMode('time');
  };

  async function uploadAvatar() {
    try {
      setUploading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: false,
        allowsEditing: true,
        quality: 1,
        aspect: [3, 1],
        exif: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log('User cancelled image picker.');
        return;
      }

      const image = result.assets[0];

      if (!image.uri) {
        throw new Error('No image uri!');
      }

      setImageUrl(image.uri);

      const fileExt = image.uri?.split('.').pop()?.toLowerCase() ?? 'jpeg';
      const path = `${Date.now()}.${fileExt}`;

      console.log('Uploading to path:', path);
      toast.show({
        title: 'uploaded playlist cover',
        description: `Uploading to ${path}`,
      });
    } catch {
      toast.error({ title: 'uploading event image failed' });
    } finally {
      setUploading(false);
    }
  }

  const handleSelectPlaylist = () => {
    setIsPlaylistModalOpen(true);
  };

  const handlePlaylistSelected = (selected: Playlist) => {
    setPlaylist(selected);
  };

  const validate = (): boolean => {
    if (!name.trim()) {
      setError('Required name.');
      console.log('Validation failed: name is required');
      return false;
    }

    setError(null);
    console.log('Validation passed');
    return true;
  };

  const handlePressValid = async () => {
    if (!validate()) return;

    const getLoc = location
      ? {
          id: initialValues?.location?.id,
          event_id: initialValues?.event?.id,
          venuename: venueName.trim() || null,
          address: location?.address ?? null,
          complement: location?.street ?? null,
          city: location?.city ?? null,
          country: location?.country ?? null,
          coordinates: `POINT(${location?.longitude} ${location?.latitude})`,
        }
      : null;

    const getLocFallback = venueName
      ? {
          id: initialValues?.location?.id,
          event_id: initialValues?.event?.id,
          venuename: venueName.trim() || null,
        }
      : null;

    const payload: MusicEventPayload = {
      name: name.trim(),
      description: description.trim() || null,
      image_url: imageUrl.trim() || null,
      playlist_id: playlist?.id || null,
      beginning_at: beginningAt ? beginningAt.toISOString() : null,
      is_private,
      everyone_can_vote,
      location: getLoc ?? getLocFallback,
      spatio_licence,
      done
    } as any;

    try {
      console.log('Submitting payload:', payload);
      await onSubmit(payload);
    } catch (e: any) {
      setError(e?.message ?? 'Unknown error while creation.');
    }
  };

  return (
    <>
      <FormControl className='p-0 m-0'>
        <ScrollView
          keyboardShouldPersistTaps='handled'
          contentContainerStyle={{ paddingTop: 0 }}
        >
          <VStack className='p-0'>
            <Box className='p-0 m-0'>
              {imageUrl ? (
                <Image
                  source={{ uri: imageUrl }}
                  style={{
                    width: '100%',
                    height: 200,
                    marginTop: 0,
                    marginBottom: 10,
                  }}
                  resizeMode='cover'
                  alt ="Event's image"
                />
              ) : (
                <Box
                  className='bg-gray-200 items-center justify-center'
                  style={{ width: '100%', height: 200, marginTop: 0 }}
                >
                  <Text className='text-gray-500'>No image selected</Text>
                </Box>
              )}

              <Button
                size='sm'
                variant='solid'
                onPress={uploadAvatar}
                disabled={uploading}
                className='mb-2 absolute right-2 top-2 z-10 rounded-full w-12 h-12 p-1.5 bg-primary-500/70 '
              >
                <ButtonIcon size='lg' className='w-7 h-7' as={Pen} />
              </Button>

              <Box className='p-4 pt-0'>
                <Text className='font-semibold'>Name</Text>
                <Input className='bg-white'>
                  <InputField
                    placeholder='Supacool event'
                    value={name}
                    onChangeText={setName}
                    autoCapitalize='sentences'
                  />
                </Input>

                <Text className='mt-2 font-semibold'>Description</Text>
                <Textarea className='bg-white'>
                  <TextareaInput
                    placeholder='Event description'
                    value={description}
                    onChangeText={setDescription}
                    autoCapitalize='sentences'
                  />
                </Textarea>

                <Text className='mt-2 font-semibold'>Playlist</Text>
                {!playlist ? (
                  <AddPlaylistItem
                    onPress={handleSelectPlaylist}
                    title='Add Playlist'
                  />
                ) : (
                  <VStack>
                    <PlaylistListItem playlist={playlist} />
                    <Button
                      size='sm'
                      variant='outline'
                      onPress={handleSelectPlaylist}
                      className='mt-2 rounded-full absolute right-4 top-9 z-10 bg-white/70'
                    >
                      <ButtonIcon as={Pen} />
                    </Button>
                  </VStack>
                )}

                <HStack className='items-between'>
                  <VStack className=''>
                    <HStack className='items-center'>
                      <Switch
                        trackColor={{ false: '#d4d4d4', true: '#000000' }}
                        thumbColor="#FFFFFF"
                        ios_backgroundColor="#d4d4d4"
                        value={is_private}
                        onToggle={() => {
                          setIsPrivate(prev => !prev);
                        }}
                      />
                      <PrivateBadge />
                      <Text>Private</Text>
                    </HStack>

                    <HStack className='items-center'>
                      <Switch
                        value={everyone_can_vote}
                        trackColor={{ false: '#d4d4d4', true: '#000000' }}
                        thumbColor="#FFFFFF"
                        ios_backgroundColor="#d4d4d4"
                        onToggle={() => {
                          setEveryoneCanVote(prev => !prev);
                        }}
                      />
                      <CollaborativeBadge />
                      <Text>Collaborative</Text>
                    </HStack>
                  </VStack>
                  <VStack className=''>
                    <HStack className='items-center'>
                      <Switch
                        trackColor={{ false: '#d4d4d4', true: '#000000' }}
                        thumbColor="#FFFFFF"
                        ios_backgroundColor="#d4d4d4"
                        value={spatio_licence}
                        onToggle={() => {
                          setSpatioLicence(prev => !prev);
                        }}
                      />
                      <SpatioLicenceBadge />
                      <Text>Spatio temporal</Text>
                    </HStack>
                    <HStack className='items-center'>
                      <Switch
                        trackColor={{ false: '#d4d4d4', true: '#000000' }}
                        thumbColor="#FFFFFF"
                        ios_backgroundColor="#d4d4d4"
                        value={done}
                        onToggle={() => {
                          setDone(prev => !prev);
                        }}
                      />
                      <EventDoneBadge light />
                      <Text>Event is done</Text>
                    </HStack>
                  </VStack>
                  

                </HStack>

                <Text className='mt-2 font-semibold'>
                  Beginning Date & Time
                </Text>
                <HStack className='gap-2 mb-2'>
                  <Button
                    size='sm'
                    variant='outline'
                    onPress={showBeginningDatepicker}
                    className='bg-white'
                  >
                    <ButtonText>Select Date</ButtonText>
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    onPress={showBeginningTimepicker}
                    className='bg-white'
                  >
                    <ButtonText>Select Time</ButtonText>
                  </Button>
                </HStack>
                <Text>Selected: {beginningAt.toLocaleString()}</Text>
                {showBeginning && (
                  <DateTimePicker
                    testID='beginningDateTimePicker'
                    value={beginningAt}
                    mode={mode}
                    is24Hour={true}
                    onChange={onBeginningChange}
                  />
                )}

                {/* ---------- LOCATION ----------- */}
                <Text className='mt-2 font-semibold'>Place name</Text>
                <Input className='bg-white'>
                  <InputField
                    placeholder='Place name'
                    value={venueName}
                    onChangeText={setVenueName}
                  />
                </Input>

                <Text className='mt-4 font-semibold'>Location</Text>
                <Box>
                  {(location && location.latitude && location.longitude) ? (
                    <Box>
                      <Text>{location.address ?? 'No address place'}</Text>
                      <Text size='xs'>
                        {location.latitude.toFixed(6)},{' '}
                        {location.longitude.toFixed(6)}
                      </Text>
                    </Box>
                  ) : (
                    <Text>No location selected</Text>
                  )}

                  <Button
                    action='primary'
                    onPress={() => setLocationOpen(true)}
                  >
                    <ButtonText>
                      {location ? "Change event's place" : "Set event's place"}
                    </ButtonText>
                  </Button>
                </Box>
              </Box>
            </Box>
            {error ? (
              <Center>
                <HStack space='xs' className='items-center'>
                  <Icon as={AlertCircleIcon} size='sm' />
                  <Text>{error}</Text>
                </HStack>
              </Center>
            ) : (
              <Center className='p-3' />
            )}

            {ApiError !== '' ? (
              <Center>
                <HStack space='xs' className='items-center color-red-500'>
                  <Icon as={AlertCircleIcon} size='sm' />
                  <Text>{ApiError}</Text>
                </HStack>
              </Center>
            ) : (
              <Center className='p-3' />
            )}

            {/* Submit */}
          </VStack>
        </ScrollView>

        <FloatButton onPress={handlePressValid} icon={Save} />
      </FormControl>

      <PlaylistSelectionModal
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
        onSelect={handlePlaylistSelected}
      />

      <LocationPickerModal
        isOpen={isLocationOpen}
        onClose={() => setLocationOpen(false)}
        onConfirm={val => {
          setLocation(val);
        }}
        initialCoords={
          (location && location.latitude && location.longitude)
            ? { latitude: location.latitude, longitude: location.longitude }
            : undefined
        }
      />
    </>
  );
}
