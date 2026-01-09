import React, { useState, useEffect } from 'react';
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
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { MapPinIcon, Pen, Save } from 'lucide-react-native';
import AddPlaylistItem from '@/components/playlist/AddPlaylistItem';
import PlaylistListItem from '@/components/playlist/PlaylistListItem';
import PlaylistSelectionModal from '@/components/playlist/PlaylistSelectionModal';
import DateTimePicker from '@react-native-community/datetimepicker';
import FloatButton from '@/components/generics/FloatButton';
import { useAppToast } from '@/hooks/useAppToast';
import * as ImagePicker from 'expo-image-picker';
import LocationPickerModal from '@/components/generics/LocationPickerModal';
import { parseLocation } from '@/utils/parsePointCoordinates';
import PrivateBadge from '@/components/generics/PrivateBadge';
import CollaborativeBadge from '@/components/generics/CollaborativeBadge';
import SpatioLicenceBadge from '@/components/generics/SpatioLicenceBadge';
import SwitchRow from '@/components/generics/SwitchRow';
import { Badge, BadgeIcon, BadgeText } from '@/components/ui/badge';
import { uploadImageToSupabase } from '@/utils/uploadImage';

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
  const [everyone_can_vote, setEveryoneCanVote] = useState(
    initialValues.event?.everyone_can_vote ?? true
  );

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

  // Sync imageUrl when initialValues change
  useEffect(() => {
    if (initialValues.event?.image_url) {
      setImageUrl(initialValues.event.image_url);
    }
  }, [initialValues.event?.image_url]);

  // DateTimePicker handlers
  const onBeginningChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || beginningAt;
    setBeginningAt(currentDate);
  };

  async function uploadEventImage() {
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

      const publicUrl = await uploadImageToSupabase(
        image.uri,
        'avatars',
        'events'
      );

      setImageUrl(publicUrl);

      toast.show({
        title: 'uploaded event image',
        description: 'Image uploaded successfully',
      });
    } catch (err: any) {
      toast.error({
        title: 'uploading event image failed',
        description: err.message,
      });
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
    const missing: string[] = [];

    if (!name.trim()) missing.push('Name');
    if (!playlist) missing.push('Playlist');
    if (!location && !venueName.trim()) missing.push('Location');

    if (missing.length > 0) {
      const msg = `Required: ${missing.join(', ')}`;
      setError(msg);
      toast.error({
        title: 'Missing required fields',
        description: msg,
      });
      return false;
    }

    setError(null);
    return true;
  };

  const handlePressValid = async () => {
    console.log('Submitting event form...');
    if (!validate()) return;

    console.log('Preparing event payload...');
    const getLoc = location
      ? {
        id: initialValues?.location?.id,
        event_id: initialValues?.event?.id,
        venuename: venueName.trim() || null,
        address: location?.address ?? null,
        complement: location?.street ?? null,
        city: location?.city ?? null,
        country: location?.country ?? null,
        coordinates:
          location && location.latitude && location.longitude
            ? { lat: location?.latitude, long: location?.longitude }
            : null,
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
      image_url: imageUrl.trim() || initialValues.event?.image_url || null,
      playlist_id: playlist?.id || null,
      beginning_at: beginningAt ? beginningAt.toISOString() : null,
      is_private,
      everyone_can_vote,
      location: getLoc ?? getLocFallback,
      spatio_licence,
    } as any;

    console.log('Event payload:', payload);
    try {
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
                  alt="Event's image"
                />
              ) : (
                <Box
                  className='bg-white items-center justify-center'
                  style={{ width: '100%', height: 200, marginTop: 0 }}
                >
                  <Text className='text-typography-500'>No image selected</Text>
                </Box>
              )}

              <Button
                size='sm'
                variant='solid'
                onPress={uploadEventImage}
                disabled={uploading}
                className='mb-2 absolute right-2 top-2 z-10 rounded-full w-12 h-12 p-1.5 bg-primary-500/70 '
              >
                <ButtonIcon size='lg' className='w-7 h-7' as={Pen} />
              </Button>

              <Box className='p-4 pt-4'>
                <Text className='font-semibold'>Name</Text>
                <Input className='bg-neutral-50 mb-3 rounded-full border'>
                  <InputField
                    placeholder='Supacool event'
                    value={name}
                    onChangeText={setName}
                    autoCapitalize='sentences'
                  />
                </Input>
                <Text size='xs' className='text-neutral-500 mt-1 mb-2'>Keep it short and friendly — this appears on event previews.</Text>

                <Text className='mt-2 font-semibold'>Description</Text>
                <Textarea className='bg-neutral-50 mb-3 rounded-lg border text-base'>
                  <TextareaInput
                    placeholder='Event description'
                    value={description}
                    onChangeText={setDescription}
                    autoCapitalize='sentences'
                    style={{ minHeight: 120 }}
                  />
                </Textarea>
                <Text size='xs' className='text-neutral-500 mt-1 mb-3'>Add a short, friendly description — 1–2 lines are ideal for previews.</Text>

                <Divider className='my-4' />

                <Heading size='lg' className='mb-2'>Playlist</Heading>
                <Text size='sm' className='text-neutral-600 mb-2'>Select which playlist will be used during the event. You can change it later.</Text>
                {!playlist ? (
                  <AddPlaylistItem
                    onPress={handleSelectPlaylist}
                    title='Add Playlist'
                  />
                ) : (
                  <VStack className='mb-3'>
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

                <Divider className='my-4' />

                <Heading size='lg' className='mb-2'>Settings</Heading>
                <Text size='sm' className='text-neutral-600 mb-2'>Control privacy, voting and temporal options for this event.</Text>

                <VStack className='px-2 space-y-4 mb-3'>
                  <SwitchRow
                    value={is_private}
                    onToggle={() => setIsPrivate(prev => !prev)}
                    leading={<PrivateBadge />}
                    label='Private'
                    helper='Private events are visible only to invited users.'
                  />

                  <SwitchRow
                    value={everyone_can_vote}
                    onToggle={() => setEveryoneCanVote(prev => !prev)}
                    leading={<CollaborativeBadge />}
                    label='Collaborative'
                    helper='Allow all attendees to vote on tracks.'
                  />

                  <SwitchRow
                    value={spatio_licence}
                    onToggle={() => setSpatioLicence(prev => !prev)}
                    leading={<SpatioLicenceBadge />}
                    label='Spatio temporal'
                    helper='Require attendees to be near the event to vote (location-based voting).'
                  />
                </VStack>

                <Divider className='my-4' />

                <Heading size='lg' className='mb-2'>Beginning Date & Time</Heading>
                <Text size='sm' className='text-neutral-600 mb-2'>Set when the event will start. Times are shown in your device timezone.</Text>
                <DateTimePicker
                  testID='beginningDateTimePicker'
                  value={beginningAt}
                  mode={"datetime"}
                  is24Hour={true}
                  onChange={onBeginningChange}
                />

                <Divider className='my-4' />

                {/* ---------- LOCATION ----------- */}
                <Heading size='lg' className='mb-2'>Location</Heading>
                <Text size='sm' className='text-neutral-600 mb-2'>Provide a venue or address so attendees can find the event. If spatio-temporal voting is enabled, location is required for voting.</Text>
                <Text className='mt-2 font-semibold'>Place name</Text>
                <Input className='bg-white mb-2 rounded-full px-4 py-3 shadow-sm border border-gray-200'>
                  <InputField
                    placeholder='Place name'
                    value={venueName}
                    onChangeText={setVenueName}
                  />
                </Input>

                <Text className='mt-4 font-semibold'>Location</Text>
                <HStack className='justify-between items-center mt-1'>
                    <Text size='sm' className='text-neutral-700 flex-1 mr-2 truncate'>
                    {location?.address ?? 'No address place'}
                    </Text>
                  <Button
                    action='primary'
                    onPress={() => setLocationOpen(true)}
                    className='mt-3 rounded-full shadow-md bg-primary-500'
                  >
                      <ButtonIcon as={MapPinIcon} />
                  </Button>
                </HStack>
                <Text size='xs' className='text-neutral-500 mt-2'>Tap to pick the event location on the map.</Text>
              </Box>
                { initialValues.event == null &&
                <Button onPress={handlePressValid} className='m-4 rounded-lg bg-primary-500 shadow-lg active:shadow-md active:scale-95 mb-6' size='xl'>
                  <ButtonIcon as={Save} className='mr-2' />
                  <ButtonText className='font-semibold'> Create Event </ButtonText>
                </Button>
                }
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

        { initialValues.event &&
          <FloatButton onPress={handlePressValid} icon={Save} />
        }
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
          location && location.latitude && location.longitude
            ? { latitude: location.latitude, longitude: location.longitude }
            : undefined
        }
      />
    </>
  );
}
