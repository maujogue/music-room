import { Button, ButtonIcon } from '@/components/ui/button';

type Props = {
  onPress: () => void;
  icon: React.ComponentType<any>;
};

export default function FloatButton({ onPress, icon }: Props) {
  return (
    <Button
      onPress={onPress}
      className='absolute bottom-4 right-4 rounded-full p-4 blurred-bg'
      variant='solid'
      size='xl'
    >
      <ButtonIcon as={icon} size='xl' />
    </Button>
  );
}
