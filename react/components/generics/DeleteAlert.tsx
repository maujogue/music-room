import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogBody,
  AlertDialogBackdrop,
} from "@/components/ui/alert-dialog"
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { CloseIcon, TrashIcon } from '@/components/ui/icon';


type Props = {
  routePath?: string
}

export default function DeleteAlert({ routePath = '../' }: Props) {

      <AlertDialog isOpen={showAlertDialog} onClose={handleClose} size="md">
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Heading className="text-typography-950 font-semibold" size="md">
              Confirm delete {playlist?.name ?? 'playlist'} ?
            </Heading>
          </AlertDialogHeader>
          <AlertDialogBody className="mt-3 mb-4">
            <Text size="sm" className='color-secondary-700'>
              Deleting the playlist will remove it permanently and cannot be undone.
              Please confirm if you want to proceed.
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter className="justify-center">
            <Button
              variant="outline"
              action="secondary"
              onPress={handleClose}
              size="sm"
            >
              <ButtonIcon as={CloseIcon} className="ml-2" />
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button size="sm" onPress={onDeletePlaylistCall}>
              <ButtonIcon as={TrashIcon} className="ml-2" />
              <ButtonText>Delete</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

}
