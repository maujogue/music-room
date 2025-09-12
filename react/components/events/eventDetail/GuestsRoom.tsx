import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Avatar, AvatarImage, AvatarFallbackText } from '@/components/ui/avatar';
import { FlatList } from 'react-native';
import { MOCK_USERS } from '@/mocks/mockUsers';
import { useCallback, useMemo, useState } from 'react';
import GuestsRoomListItem from '@/components/events/eventDetail/GuestRoomListItem';
import { useProfile } from '@/contexts/profileCtx';
import DeleteAlert from '@/components/generics/DeleteAlert';


interface Props {
  data: MusicEventFetchResult;

}

export default function GuestsRoom({ data }: Props) {
   // TODO [NOTE]: remplacer par data.members quand le backend sera prêt
  const initialMembers = useMemo<UserInfo[]>(() => MOCK_USERS, []);
  const [members, setMembers] = useState<UserInfo[]>(initialMembers);
  const { profile } = useProfile();
  const [showAlertDialog, setShowAlertDialog] = useState(false);

  const onPressRemove = (user: UserInfo) => {
    setShowAlertDialog(true)
  }

  const handleRemove = useCallback((user: UserInfo) => {
    // TODO :  here try catch + logic to handle remove members from event
    // [NOTE] : Keep setMembers after fetch result .ok
    setMembers(prev => prev.filter(u => u.id !== user.id));
  }, []);

  const showRemove = () => { return !!profile && profile.id == data.owner.id }

  return (
    <>
    <VStack className="flex-1 w-full p-4">

      {/* Owner */}
      <VStack space="sm" className="mb-6">
        <Heading size="md">Owner</Heading>
        <HStack space="md" className="items-center pl-4">
          <Avatar size="lg">
            <AvatarFallbackText>{data.owner.username}</AvatarFallbackText>
            <AvatarImage source={{ uri: data.owner.avatar_url }} />
          </Avatar>
          <Text>{data.owner.username}</Text>
        </HStack>
      </VStack>

      {/* Guests */}
      <Heading size="md" className="mb-2">Guests</Heading>
      {/* <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HStack space="md" className="items-center pl-4 mb-2">
            <Avatar size="sm">
              <AvatarFallbackText>{item.username}</AvatarFallbackText>
              <AvatarImage source={{ uri: item.avatar_url }} />
            </Avatar>
            <Text>{item.username}</Text>
          </HStack>
        )}
      /> */}
      <FlatList
        data={members}
        keyExtractor={(user: UserInfo) => user.id}
        renderItem={({ item }) => (
          <GuestsRoomListItem guest={item} onRemove={onPressRemove} showRemove={showRemove()} />
        )}
        ItemSeparatorComponent={() => <VStack className="h-[1px] bg-outline-200" />}
        ListEmptyComponent={
          <Text size={"sm"} className="pl-4 py-2 text-secondary-700">No guest yet.</Text>
        }
      />

    </VStack>

    <DeleteAlert
      showAlertDialog={showAlertDialog}
      setShowAlertDialog={setShowAlertDialog}
      onDelete={handleRemove}
      itemName={playlist?.name ?? 'playlist'}
      itemType='playlist'
    />
    </>
  );
}
