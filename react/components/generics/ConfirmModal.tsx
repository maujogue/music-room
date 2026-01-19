import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogBody,
  AlertDialogBackdrop,
} from '@/components/ui/alert-dialog';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { CloseIcon, TrashIcon, CheckIcon } from '@/components/ui/icon';

type IconType = React.ComponentType<any>;

type ConfirmDialogProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  destructive?: boolean;
  confirmIcon?: IconType;
  cancelIcon?: IconType;
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  preventAutoCloseOnConfirm?: boolean;
  className?: string;
};

export default function ConfirmDialog({
  isOpen,
  setIsOpen,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  destructive = false,
  confirmIcon,
  cancelIcon,
  size = 'md',
  children,
  preventAutoCloseOnConfirm = false,
  className,
}: ConfirmDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    if (!submitting) setIsOpen(false);
  };

  const handleConfirm = async () => {
    try {
      const maybePromise = onConfirm?.();
      if (maybePromise && typeof (maybePromise as Promise<void>).then === 'function') {
        setSubmitting(true);
        await (maybePromise as Promise<void>);
      }
      if (!preventAutoCloseOnConfirm) setIsOpen(false);
    } catch (e) {

    } finally {
      setSubmitting(false);
    }
  };

  const ConfirmIcon =
    confirmIcon ??
    (destructive ? TrashIcon : CheckIcon);

  const CancelIcon = cancelIcon ?? CloseIcon;

  return (
    <AlertDialog isOpen={isOpen} onClose={handleClose} size={size}>
      <AlertDialogBackdrop />
      <AlertDialogContent className={className}>
        <AlertDialogHeader>
          {typeof title === 'string' ? (
            <Heading className="text-typography-950 font-semibold" size="md">
              {title}
            </Heading>
          ) : (
            title
          )}
        </AlertDialogHeader>

        <AlertDialogBody className="mt-3 mb-4">
          {description && (
            typeof description === 'string' ? (
              <Text size="sm" className="text-secondary-700">{description}</Text>
            ) : description
          )}
          {children}
        </AlertDialogBody>

        <AlertDialogFooter className="justify-center gap-3">
          <Button
            variant="outline"
            action="secondary"
            onPress={handleClose}
            size="sm"
            disabled={submitting}
          >
            <ButtonIcon as={CancelIcon} className="ml-2" />
            <ButtonText>{cancelText}</ButtonText>
          </Button>

          <Button
            size="sm"
            onPress={handleConfirm}
            disabled={submitting}
            variant={destructive ? 'solid' : 'solid'}
            action={destructive ? 'negative' : 'primary'}
          >
            <ButtonIcon as={ConfirmIcon} className="ml-2" />
            <ButtonText>{submitting ? 'Sending…' : confirmText}</ButtonText>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
