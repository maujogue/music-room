import React, { useState } from 'react';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { HStack } from '@/components/ui/hstack';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Box } from '@/components/ui/box';
import { Icon, CheckIcon, AlertCircleIcon } from '@/components/ui/icon';
import { Center } from '@/components/ui/center';
import { FormControl } from '@/components/ui/form-control';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { ScrollView, Image } from 'react-native';
import { ImagePlus } from 'lucide-react-native';
import AddPlaylistItem from '@/components/playlist/AddPlaylistItem';
import PlaylistListItem from '@/components/playlist/PlaylistListItem';
import PlaylistSelectionModal from '@/components/playlist/PlaylistSelectionModal';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

type Props = {
  onSubmit: (payload: EventPayload) => Promise<void> | void;
  ApiError: string;
  initialValues?: Partial<Event>;
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
  const [imageUrl, setImageUrl] = useState(initialValues.event?.image_url ?? '');
  const [playlist, setPlaylist] = useState<Playlist | null>(initialValues.playlist ?? null);
  const [beginningAt, setBeginningAt] = useState(
    initialValues.event?.beginning_at ? new Date(initialValues.event.beginning_at) : new Date()
  );
  const [endingAt, setEndingAt] = useState(
    initialValues.event?.ending_at ? new Date(initialValues.event.ending_at) : new Date()
  );

  // DateTimePicker states
  const [showBeginning, setShowBeginning] = useState(false);
  const [showEnding, setShowEnding] = useState(false);
  const [mode, setMode] = useState<'date' | 'time'>('date');

  // location fields
  const initialLocation = (initialValues as any).location ?? {};
  const [venueName, setVenueName] = useState(initialLocation.venueName ?? '');
  const [complement, setComplement] = useState(
    initialLocation.complement ?? ''
  );
  const [address, setAddress] = useState(initialLocation.address ?? '');
  const [city, setCity] = useState(initialLocation.city ?? '');
  const [country, setCountry] = useState(initialLocation.country ?? '');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // DateTimePicker handlers
  const onBeginningChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || beginningAt;
    setShowBeginning(false);
    setBeginningAt(currentDate);
  };

  const onEndingChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || endingAt;
    setShowEnding(false);
    setEndingAt(currentDate);
  };

  const showBeginningMode = (currentMode: 'date' | 'time') => {
    setShowBeginning(true);
    setMode(currentMode);
  };

  const showEndingMode = (currentMode: 'date' | 'time') => {
    setShowEnding(true);
    setMode(currentMode);
  };

  const showBeginningDatepicker = () => {
    showBeginningMode('date');
  };

  const showBeginningTimepicker = () => {
    showBeginningMode('time');
  };

  const showEndingDatepicker = () => {
    showEndingMode('date');
  };

  const showEndingTimepicker = () => {
    showEndingMode('time');
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

      // Preview immediately using local uri
      setImageUrl(image.uri);

      const arraybuffer = await fetch(image.uri).then(res => res.arrayBuffer());

      const fileExt = image.uri?.split('.').pop()?.toLowerCase() ?? 'jpeg';
      const path = `${Date.now()}.${fileExt}`;

      console.log('Uploading to path:', path);

      // (optional) perform upload to Supabase here and update imageUrl to public URL when done
      // ...existing upload logic...

    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      } else {
        throw error;
      }
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

    const payload: EventPayload = {
      name: name.trim(),
      description: description.trim() || null,
      image_url: imageUrl.trim() || null,
      playlist_id: playlist?.id || null,
      beginning_at: beginningAt ? beginningAt.toISOString() : null,
      ending_at: endingAt ? endingAt.toISOString() : null,
      // include location as nested object to match get_complete_event structure
      location: {
        venuename: venueName.trim() || null,
        complement: complement.trim() || null,
        address: address.trim() || null,
        city: city.trim() || null,
        country: country.trim() || null,
      } as any,
    } as any;

    try {
      setLoading(true);
      console.log('Submitting payload:', payload);
      await onSubmit(payload);
    } catch (e: any) {
      setError(e?.message ?? 'Unknown error while creation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FormControl className='p-4 border rounded-lg border-outline-300'>
        <ScrollView
          contentContainerStyle={{ paddingVertical: 8 }}
          keyboardShouldPersistTaps='handled'
        >
          <VStack space='md'>
            <Box>
              <Button
                size='sm'
                variant='outline'
                className='my-4'
                onPress={uploadAvatar}
                disabled={uploading}
              >
                <ButtonText>Upload Image</ButtonText>
                <ButtonIcon as={ImagePlus} />
              </Button>

              {imageUrl ? (
                <Image
                  source={{ uri: imageUrl }}
                  style={{ width: '100%', height: 200, borderRadius: 8, marginBottom: 12 }}
                  resizeMode='center'
                />
              ) : null}

              <Text>Name</Text>
              <Input>
                <InputField
                  placeholder='Supacool event'
                  value={name}
                  onChangeText={setName}
                  autoCapitalize='sentences'
                />
              </Input>

              <Text className='mt-2'>Description</Text>
              <Textarea>
                <TextareaInput
                  placeholder='Event description'
                  value={description}
                  onChangeText={setDescription}
                  autoCapitalize='sentences'
                />
              </Textarea>


              <Text className='mt-2'>Playlist</Text>
              { !playlist ? (
                <AddPlaylistItem onPress={handleSelectPlaylist} title="Add Playlist" />
              ) : (
                <VStack>
                  <PlaylistListItem playlist={playlist} />
                  <Button
                    size="sm"
                    variant="outline"
                    onPress={handleSelectPlaylist}
                    className="mt-2"
                  >
                    <Text>Change Playlist</Text>
                  </Button>
                </VStack>
              )}

              <Text className='mt-2'>Beginning Date & Time</Text>
              <HStack className="gap-2 mb-2">
                <Button size="sm" variant="outline" onPress={showBeginningDatepicker}>
                  <ButtonText>Select Date</ButtonText>
                </Button>
                <Button size="sm" variant="outline" onPress={showBeginningTimepicker}>
                  <ButtonText>Select Time</ButtonText>
                </Button>
              </HStack>
              <Text>Selected: {beginningAt.toLocaleString()}</Text>
              {showBeginning && (
                <DateTimePicker
                  testID="beginningDateTimePicker"
                  value={beginningAt}
                  mode={mode}
                  is24Hour={true}
                  onChange={onBeginningChange}
                />
              )}

              <Text className='mt-4'>Ending Date & Time</Text>
              <HStack className="gap-2 mb-2">
                <Button size="sm" variant="outline" onPress={showEndingDatepicker}>
                  <ButtonText>Select Date</ButtonText>
                </Button>
                <Button size="sm" variant="outline" onPress={showEndingTimepicker}>
                  <ButtonText>Select Time</ButtonText>
                </Button>
              </HStack>
              <Text>Selected: {endingAt.toLocaleString()}</Text>
              {showEnding && (
                <DateTimePicker
                  testID="endingDateTimePicker"
                  value={endingAt}
                  mode={mode}
                  is24Hour={true}
                  onChange={onEndingChange}
                />
              )}

              <Text className='mt-4 font-medium'>Location</Text>

              <Text className='mt-2'>Venue name</Text>
              <Input>
                <InputField
                  placeholder='Venue name'
                  value={venueName}
                  onChangeText={setVenueName}
                />
              </Input>

              <Text className='mt-2'>Complement</Text>
              <Input>
                <InputField
                  placeholder='Suite, floor...'
                  value={complement}
                  onChangeText={setComplement}
                />
              </Input>

              <Text className='mt-2'>Address</Text>
              <Input>
                <InputField
                  placeholder='Street address'
                  value={address}
                  onChangeText={setAddress}
                />
              </Input>

              <Text className='mt-2'>City</Text>
              <Input>
                <InputField
                  placeholder='City'
                  value={city}
                  onChangeText={setCity}
                />
              </Input>

              <Text className='mt-2'>Country</Text>
              <Input>
                <InputField
                  placeholder='Country'
                  value={country}
                  onChangeText={setCountry}
                />
              </Input>
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
            <Button
              size='md'
              variant='solid'
              disabled={loading}
              onPress={handlePressValid}
              action='positive'
            >
              <Icon as={CheckIcon} color='white' size='sm' />
            </Button>
          </VStack>
        </ScrollView>
      </FormControl>

      <PlaylistSelectionModal
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
        onSelect={handlePlaylistSelected}
      />
    </>
  );
}
