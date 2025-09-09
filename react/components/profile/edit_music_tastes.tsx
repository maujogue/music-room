import React, { useState } from 'react';
import { Text, Pressable } from 'react-native';
import { Badge } from '../ui/badge';
import { Heading } from '../ui/heading';
import { VStack } from '../ui/vstack';
import {
  Select,
  SelectItem,
  SelectContent,
  SelectPortal,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectBackdrop,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
} from '../ui/select';
import { ChevronDownIcon } from '../ui/icon';
import { HStack } from '../ui/hstack';
import { useProfile } from '../../contexts/profileCtx';

// Example list of music genres, each with a color
const MUSIC_GENRES = [
  { label: 'Rock', value: 'rock', color: '#e57373' }, // red
  { label: 'Pop', value: 'pop', color: '#ba68c8' }, // purple
  { label: 'Jazz', value: 'jazz', color: '#4db6ac' }, // teal
  { label: 'Hip Hop', value: 'hiphop', color: '#ffd54f' }, // yellow
  { label: 'Classical', value: 'classical', color: '#90caf9' }, // blue
  { label: 'Electronic', value: 'electronic', color: '#81c784' }, // green
  { label: 'Country', value: 'country', color: '#ffb74d' }, // orange
  { label: 'Reggae', value: 'reggae', color: '#aed581' }, // light green
  { label: 'Blues', value: 'blues', color: '#64b5f6' }, // light blue
  { label: 'Metal', value: 'metal', color: '#b0bec5' }, // grey
];

export default function EditMusicTastes({
  currentText,
  isEdit,
}: {
  currentText: string[];
  isEdit: boolean;
}) {
  const [selectedGenres, setSelectedGenres] = useState<string[]>(currentText);
  const { updateProfile } = useProfile();

  // Always pass the new genres array directly to handleUpdateGenres to avoid async state lag
  const handleSelect = async (value: string) => {
    if (!selectedGenres.includes(value)) {
      let newGenres;
      if (selectedGenres.length >= 3) {
        // If already 3, replace the first with the new one
        newGenres = [...selectedGenres.slice(1), value];
      } else {
        newGenres = [...selectedGenres, value];
      }
      setSelectedGenres(newGenres);
      await handleUpdateGenres(newGenres);
    }
  };

  // Remove genre from selection
  const handleRemove = async (value: string) => {
    const newGenres = selectedGenres.filter(v => v !== value);
    setSelectedGenres(newGenres);
    await handleUpdateGenres(newGenres);
  };

  const handleUpdateGenres = async (genres: string[]) => {
    const { error } = await updateProfile({ music_genre: genres });
    if (error) {
      console.error('Error updating genres:', error);
    }
  };
  return (
    <VStack className='px-3'>

      <HStack className='gap-2 mx-2 items-center min-h-10'>
        <HStack>
          {selectedGenres.length === 0 ? (
            <Text style={{ color: '#888' }} className='my-1 mx-3 flex-1'>
              No genres selected
            </Text>
          ) : (
            selectedGenres.map(value => {
              const genre = MUSIC_GENRES.find(g => g.value === value);
              if (!genre) return null;
              const badgeColor = genre.color || '#ccc';
              return (
                <Pressable
                  key={value}
                  onPress={() => isEdit && handleRemove(value)}
                  style={{ marginRight: 8 }}
                  accessibilityRole='button'
                  accessibilityLabel={`Remove ${genre.label}`}
                >
                  <Badge
                    style={{
                      backgroundColor: badgeColor,
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                      {genre.label}{' '}
                      {isEdit && (
                        <Text style={{ color: '#fff', fontWeight: 'normal' }}>
                          ×
                        </Text>
                      )}
                    </Text>
                  </Badge>
                </Pressable>
              );
            })
          )}
        </HStack>
        {isEdit && (
          <Select
            className='ml-auto'
            onValueChange={async (value: string) => {
              await handleSelect(value);
            }}
          >
            <SelectTrigger variant='underlined' size='md'>
              <SelectInput
                placeholder={`Add genres (${selectedGenres.length}/3)`}
                value=''
                editable={false}
                pointerEvents='none'
              />
              <SelectIcon className='mr-3' as={ChevronDownIcon} />
            </SelectTrigger>
            <SelectPortal>
              <SelectBackdrop />
              <SelectContent>
                <SelectDragIndicatorWrapper>
                  <SelectDragIndicator />
                </SelectDragIndicatorWrapper>
                {MUSIC_GENRES.filter(
                  genre => !selectedGenres.includes(genre.value)
                ).map(genre => (
                  <SelectItem
                    key={genre.value}
                    label={genre.label}
                    value={genre.value}
                    isSelected={false}
                  />
                ))}
              </SelectContent>
            </SelectPortal>
          </Select>
        )}
      </HStack>
    </VStack>
  );
}
