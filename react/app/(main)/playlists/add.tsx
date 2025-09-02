import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Link, router } from 'expo-router';

export default function AddNewPlayList() {

  const isPresented = router.canGoBack();

  return (
    <Box>
      <Text>YOP</Text>
      {isPresented && <Link href="../">Cancel</Link>}
    </Box>
  );
}
