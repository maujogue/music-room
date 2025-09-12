import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';

type Props<T> = {
  title: string;
  items: T[] | undefined;
  limit?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  onShowMore?: (label: string) => void;
};

export default function ResultsSection<T>({
  title,
  items,
  limit,
  renderItem,
  onShowMore,
}: Props<T>) {
  if (!items || items.length === 0) return null;

  // Filter out null/undefined items
  const validItems = items.filter(item => item != null);
  if (validItems.length === 0) return null;

  const sliced = limit ? validItems.slice(0, limit) : validItems;

  return (
    <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
      <Text className='text-lg font-semibold'>{title}</Text>
      {sliced.map((item, i) => (
        <View key={(item as any)?.id || `${title}-${i}`}>
          {renderItem(item as T, i)}
        </View>
      ))}
      {limit && validItems.length > limit && (
        <Pressable onPress={() => onShowMore?.(title)}>
          <Text className='text-primary-500 mt-2'>Show more</Text>
        </Pressable>
      )}
    </View>
  );
}
