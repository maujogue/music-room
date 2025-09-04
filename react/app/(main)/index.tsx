import { Text, View } from 'react-native';
import { SearchBar } from '@/components/ui/searchbar';
import { searchApi } from '@/services/search.ts'
import { useAuth } from '@/contexts/authCtx';

export default function Index() {
  const { signOut } = useAuth();

  async function handleSearchSubmit(query) {
    console.log("handleSearchSubmit")
  }

  async function handleSearchChange(query) {
    const type = "user";

    if (query) {
      await searchApi(query, type);
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text
        style={{margin: 12, fontWeight: 'bold'}}>
        Search for a friend
      </Text>

      <SearchBar
        onSubmit={handleSearchSubmit}
        onChangeText={handleSearchChange}>
      </SearchBar>

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
