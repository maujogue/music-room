import React, { useState } from 'react';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { HStack } from '@/components/ui/hstack';
import { Button } from '@/components/ui/button';
import { Icon, CheckIcon, AlertCircleIcon } from '@/components/ui/icon';
import { Center } from '@/components/ui/center';
import { FormControl } from '@/components/ui/form-control';
import { PlaylistPayload } from '@/types/playlist';
import { Textarea, TextareaInput } from '@/components/ui/textarea';

type Props = {
  onSubmit: (payload: PlaylistPayload) => Promise<void> | void;
  ApiError: string;
  initialValues?: Playlist;
};

export default function EditPlayListForm({
  initialValues,
  ApiError,
  onSubmit,
}: Props) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [description, setDescription] = useState(
    initialValues?.description ?? ''
  );
  const [isPrivate, setIsPrivate] = useState<boolean>(
    initialValues?.is_private ?? true
  );
  const [isCollaborative, setIsCollaborative] = useState<boolean>(
    initialValues?.is_collaborative ?? false
  );

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

    const payload: PlaylistPayload = {
      name: name.trim(),
      is_private: isPrivate,
      is_collaborative: isCollaborative,
      description: description.trim() || undefined,
    };

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
      <VStack space='md'>
        <Box>
          <Text>Name</Text>
          <Input>
            <InputField
              placeholder='Coolich Playlist'
              value={name}
              onChangeText={setName}
              autoCapitalize='sentences'
            />
          </Input>
        </Box>

        <Box>
          <Text>Description</Text>
          <Textarea className=''>
            <TextareaInput
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical='top'
              autoCapitalize='sentences'
            />
          </Textarea>
        </Box>

        <VStack className='items-start'>
          <HStack className='items-center'>
            <Switch
              value={isPrivate}
              onToggle={() => {
                setIsPrivate(prev => !prev);
              }}
            />
            <Text>Private</Text>
          </HStack>

          <HStack className='items-center'>
            <Switch
              value={isCollaborative}
              onToggle={() => {
                setIsCollaborative(prev => !prev);
              }}
            />
            <Text>Collaborative</Text>
          </HStack>
        </VStack>

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
    </FormControl>
  );
}
