import { Toast, ToastTitle, ToastDescription } from '@/components/ui/toast';
import { Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AppToastProps = {
  id?: string;
  title: string;
  description?: string;
  action?: 'success' | 'error' | 'warning' | 'info' | undefined;
  variant?: 'solid' | 'outline';
  placement?:
    | 'top'
    | 'bottom'
    | 'top right'
    | 'bottom right'
    | 'top left'
    | 'bottom left';
};

export function AppToast({
  id,
  title,
  description,
  action,
  variant = 'solid',
  placement = 'top',
}: AppToastProps) {
  const isTop = placement.includes('top');

  const toastContent = (
    <Toast nativeID={id} action={action} variant={variant}>
      <ToastTitle>{title}</ToastTitle>
      {description ? <ToastDescription>{description}</ToastDescription> : null}
    </Toast>
  );

  if (isTop && Platform.OS === 'android') {
    return <SafeAreaView edges={['top']}>{toastContent}</SafeAreaView>;
  }

  return toastContent;
}
