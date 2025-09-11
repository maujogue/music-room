import React, { useState } from 'react';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { HStack } from '@/components/ui/hstack';
import { Button } from '@/components/ui/button';
import { Icon, CheckIcon, AlertCircleIcon } from '@/components/ui/icon';
import { Center } from '@/components/ui/center';
import { FormControl } from '@/components/ui/form-control';
import { Switch } from '@/components/ui/switch';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { ScrollView } from 'react-native';

type Props = {
  onSubmit: (payload: EventPayload) => Promise<void> | void;
  ApiError: string;
  initialValues?: Partial<EventPayload>;
};

export default function EditEventForm({
  initialValues = {},
  ApiError,
  onSubmit,
}: Props) {
  const [name, setName] = useState(initialValues.name ?? '');
  const [description, setDescription] = useState(
    initialValues.description ?? ''
  );
  const [imageUrl, setImageUrl] = useState(initialValues.image_url ?? '');
  const [playlistId, setPlaylistId] = useState(initialValues.playlist_id ?? '');
  const [beginningAt, setBeginningAt] = useState(
    // store as ISO string or empty
    initialValues.beginning_at ? String(initialValues.beginning_at) : ''
  );
  const [endingAt, setEndingAt] = useState(
    initialValues.ending_at ? String(initialValues.ending_at) : ''
  );

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

  const validate = (): boolean => {
    if (!name.trim()) {
      setError('Required name.');
      return false;
    }

    setError(null);
    return true;
  };

  const handlePressValid = async () => {
    if (!validate()) return;

    const payload: EventPayload = {
      name: name.trim(),
      description: description.trim() || null,
      image_url: imageUrl.trim() || null,
      playlist_id: playlistId.trim() || null,
      beginning_at: beginningAt ? beginningAt : null,
      ending_at: endingAt ? endingAt : null,
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
      await onSubmit(payload);
    } catch (e: any) {
      setError(e?.message ?? 'Unknown error while creation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormControl className='p-4 border rounded-lg border-outline-300'>
      <ScrollView
        contentContainerStyle={{ paddingVertical: 8 }}
        keyboardShouldPersistTaps='handled'
      >
        <VStack space='md'>
          <Box>
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

            <Text className='mt-2'>Image URL</Text>
            <Input>
              <InputField
                placeholder='https://...'
                value={imageUrl}
                onChangeText={setImageUrl}
                autoCapitalize='none'
              />
            </Input>

            <Text className='mt-2'>Playlist ID</Text>
            <Input>
              <InputField
                placeholder='spotify:playlist:...'
                value={playlistId}
                onChangeText={setPlaylistId}
                autoCapitalize='none'
              />
            </Input>

            <Text className='mt-2'>Beginning (ISO string)</Text>
            <Input>
              <InputField
                placeholder='2025-09-09T18:00:00Z'
                value={beginningAt}
                onChangeText={setBeginningAt}
                autoCapitalize='none'
              />
            </Input>

            <Text className='mt-2'>Ending (ISO string)</Text>
            <Input>
              <InputField
                placeholder='2025-09-09T20:00:00Z'
                value={endingAt}
                onChangeText={setEndingAt}
                autoCapitalize='none'
              />
            </Input>

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
  );
}
