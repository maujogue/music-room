import Search from '@/components/search/Search';
import UserListItem from '@/components/profile/UserListItem';
import { useLocalSearchParams } from 'expo-router';
import { inviteMemberToPlaylist } from '@/services/playlist';

export default function Invite() {
    const { playlistId } = useLocalSearchParams<{ playlistId: string }>();
    const handleUserPress = (user: any) => {
        inviteMemberToPlaylist(playlistId, user.id)
            .then(() => {
                console.log('User invited successfully');
            })
            .catch((error) => {
                console.error('Error inviting user:', error);
            });
    };

    return (
        <Search
            placeholder='Search for users to invite to your playlist...'
            showFilters={false}
            defaultType='Users'
            renderItemUser={(item: any) => (
                <UserListItem
                    user={item}
                    key={item.id}
                    showActionButtons={false}
                    onUserPress={(user) => handleUserPress(user)}
                />
            )}
        />
    )
}
