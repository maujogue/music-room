import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { Center } from '@/components/ui/center';

interface Props {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

export default function TabButton({ label, isActive, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole='tab'
      accessibilityState={{ selected: isActive }}
    >
      <Center
        className={`px-2 py-1 min-w-20 rounded-xl ${isActive ? 'bg-indigo-500' : 'bg-typography-800'}`}
      >
        <Text className={'text-typography-900'}>{label}</Text>
      </Center>
    </Pressable>
  );
}
