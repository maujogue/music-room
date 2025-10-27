import { Button, ButtonIcon } from '@/components/ui/button';
import React from 'react';

type Props = {
  onPress?: () => void;
  icon: React.ComponentType<any>;
  className?: string;
  [key: string]: any;
};

const FloatButton = React.forwardRef<any, Props>(function FloatButton(
  { icon, className, ...rest },
  ref
) {
  return (
    <Button
      {...rest}
      ref={ref}
      className={
        className ?? 'absolute bottom-4 right-4 rounded-full p-4 blurred-bg'
      }
      variant='solid'
      size='xl'
    >
      <ButtonIcon as={icon} size='xl' />
    </Button>
  );
});

export default FloatButton;
