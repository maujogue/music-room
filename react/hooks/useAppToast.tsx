// hooks/useAppToast.ts
import { AppToast } from '@/components/generics/AppToast';
import { useToast } from '@/components/ui/toast';

type ShowArgs = {
  title: string;
  description?: string;
  duration?: number;
  placement?:
    | 'top'
    | 'bottom'
    | 'top right'
    | 'bottom right'
    | 'top left'
    | 'bottom left';
};

export function useAppToast() {
  const toast = useToast();

  const show =
    (action: 'success' | 'error' | 'warning' | 'info' | undefined) =>
    ({ title, description, duration = 1500, placement = 'top' }: ShowArgs) =>
      toast.show({
        placement,
        duration,
        render: ({ id }) => (
          <AppToast
            id={id}
            action={action}
            title={title}
            description={description}
            variant='solid'
            placement={placement}
          />
        ),
      });

  return {
    show: show(undefined),
    success: show('success'),
    error: show('error'),
    warning: show('warning'),
    info: show('info'),
  };
}
