import { Toast, ToastTitle, ToastDescription } from '@/components/ui/toast';

type AppToastProps = {
  id?: string;
  title: string;
  description?: string;
  action?: 'success' | 'error' | 'warning' | 'info' | undefined;
  variant?: 'solid' | 'outline';
};

export function AppToast({
  id,
  title,
  description,
  action,
  variant = 'solid',
}: AppToastProps) {
  return (
    <Toast
      nativeID={id}
      action={action}
      variant={variant}
    >
      <ToastTitle>{title}</ToastTitle>
      {description ? <ToastDescription>{description}</ToastDescription> : null}
    </Toast>
  );
}
