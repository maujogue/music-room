import React, { useState } from 'react';
import { Box } from '@/components/ui/box';
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

type Props = {
  onSubmit: (payload: EventPayload) => Promise<void> | void;
  ApiError: string,
  initialValues?: Partial<EventPayload>;
};

export default function EditEventForm({initialValues = {}, ApiError,  onSubmit}: Props) {
  const [name, setName] = useState(initialValues.name ?? '');

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
    <FormControl className="p-4 border rounded-lg border-outline-300">
      <VStack space="md">
        <Box>
          <Text>Name</Text>
          <Input>
            <InputField placeholder="Supacool event"
              value={name} onChangeText={setName} autoCapitalize="sentences" />
          </Input>
        </Box>

        {error ? (
          <Center>
            <HStack space="xs" className="items-center">
              <Icon as={AlertCircleIcon} size="sm" />
              <Text>{error}</Text>
            </HStack>
          </Center>
        ) : <Center className='p-3' />}

        {ApiError !== '' ? (
          <Center>
            <HStack space="xs" className="items-center color-red-500">
              <Icon as={AlertCircleIcon} size="sm" />
              <Text>{ApiError}</Text>
            </HStack>
          </Center>
        ) : <Center className='p-3' />}

        {/* Submit */}
        <Button
          size="md"
          variant="solid"
          disabled={loading}
          onPress={handlePressValid}
          action='positive'
        >
          <Icon as={CheckIcon} color="white" size="sm" />
        </Button>
      </VStack>
    </FormControl>
  );
}
