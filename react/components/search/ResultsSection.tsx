import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';

type Props<T> = {
	title: string;
	items: T[] | undefined;
	limit?: number;
	renderItem: (item: T, index: number) => React.ReactNode;
	// optional: label to pass to onShowMore when user wants to see full list
	onShowMore?: (label: string) => void;
};

export default function ResultsSection<T>({ title, items, limit, renderItem, onShowMore }: Props<T>) {
	if (!items || items.length === 0) return null;
	const sliced = limit ? items.slice(0, limit) : items;
	return (
		<View style={{ paddingHorizontal: 16, marginTop: 12 }}>
			<Text className="text-lg font-semibold">{title}</Text>
			{sliced.map((it, i) => (
				<View key={(it as any).id ?? i}>
					{renderItem(it as T, i)}
				</View>
			))}
			{limit && items.length > limit && (
				<Pressable
					onPress={() => onShowMore?.(title)}
				>
					<Text className="text-primary-500 mt-2">Voir plus</Text>
				</Pressable>
			)}
		</View>
	);
}
