import { Text, View } from 'react-native';
import { SearchBar } from '@/components/ui/searchbar';

import { useAuth } from '@/contexts/authCtx';

export default function Index() {
  const { signOut } = useAuth();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>


      <Text
        style={{margin: 12, fontWeight: 'bold'}}>
        Search for a friend
      </Text>

      <SearchBar></SearchBar>

      <Text
        onPress={() => {
          signOut();
        }}
        style={{margin: 48, fontSize: 18, fontWeight: 'bold'}}
      >
        Sign Out
      </Text>
    </View>
  );
}
