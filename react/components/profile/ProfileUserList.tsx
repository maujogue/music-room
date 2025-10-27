import UserList from '@/components/profile/UserList';

type ProfileUserListType = 'followers' | 'following';

interface ProfileUserListProps {
  userId: string;
  type: ProfileUserListType;
  title: string;
}

export default function ProfileUserList({
  userId,
  type,
  title,
}: ProfileUserListProps) {
  return (
    <UserList
      type={type}
      title={title}
      showFollowButtons={true}
      userId={userId}
    />
  );
}
