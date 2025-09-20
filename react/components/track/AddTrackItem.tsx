import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { AddIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';

type Props = {
    playlistId: string;
    playlistTitle?: string;
};

export default function AddTrackItem({ playlistId, playlistTitle }: Props) {
    const router = useRouter();

    const handleAddTrackPress = () => {
    router.push({
        pathname: '/(main)/playlists/[playlistId]/tracks/add',
        params: { playlistId, playlistTitle },
    });
    };

    return (
        <Pressable onPress={handleAddTrackPress} className='px-2'>
            <Card
                size="sm"
                className="rounded-xl h-[60px] mb-2"
                variant="filled"
            style={{ backgroundColor: '#111827' }} // dark background
        >
            <HStack className="py-1 flex-1 justify-start items-center gap-4">
            <Box
                className="rounded-md h-[60px] w-[60px] justify-center items-center"
                style={{ backgroundColor: '#0f172a' }} // slightly different dark tone
            >
            <Icon as={AddIcon} size="2xl" color="white" />
            </Box>
            <Text size="sm" className="text-white font-medium">
                Add Track
            </Text>
            </HStack>
        </Card>
    </Pressable>
    );
}
