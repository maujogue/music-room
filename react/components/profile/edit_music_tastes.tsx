import React, { useState } from 'react';
import { Text, Pressable } from 'react-native';
import { Badge } from '../ui/badge';
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

export default function EditMusicTastes({ isEdit }: { isEdit: boolean }) {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const handleSelect = (value: string) => {
    if (!selectedGenres.includes(value)) {
      if (selectedGenres.length >= 3) {
        // If already 3, replace the first with the new one
        setSelectedGenres([...selectedGenres.slice(1), value]);
      } else {
        setSelectedGenres([...selectedGenres, value]);
      }
    }
  };

  // Remove genre from selection
  const handleRemove = (value: string) => {
    setSelectedGenres(selectedGenres.filter(v => v !== value));
  };

  return (
    <HStack className='gap-2 mx-2 items-center h-10'>
      <HStack>
        {selectedGenres.length === 0 ? (
          <Text style={{ color: '#888' }}>No genres selected</Text>
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
          // The value is not controlled here, since we want multi-select behavior
          // We use onSelectItem to handle selection
          onValueChange={(value: string) => {
            handleSelect(value);
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
  );
}
