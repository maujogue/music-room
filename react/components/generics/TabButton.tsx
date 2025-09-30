import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { Center } from '@/components/ui/center';

interface Props {
  label: string;
  isActive: boolean;
  onPress: () => void;
  className?: string;
}

export default function TabButton({ label, isActive, onPress, className }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole='tab'
      accessibilityState={{ selected: isActive }}
      className="w-full"
    >
      <Center
        className={className}
      >
        <Text className={'text-typography-900'}>{label}</Text>
      </Center>
    </Pressable>
  );
}
