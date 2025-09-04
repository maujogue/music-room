import { Text, View, StyleSheet, SafeAreaView } from 'react-native';
import { SearchBar } from '@/components/ui/searchbar';
import { searchApi } from '@/services/search.ts'
import { useAuth } from '@/contexts/authCtx';
import { Button } from '@/components/ui/button'
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.mainContainer}>
          {/* Contenu centré */}
          <View style={styles.centeredContent}>
            <Text style={styles.titleText}>
              Search for a friend
            </Text>
            <SearchBar
              onSubmit={handleSearchSubmit}
              onChangeText={handleSearchChange}
            />
          </View>

          <Button
            onPress={() => {
              signOut();
            }}
            style={styles.signOutButton}
          >
            <Text style={{color: '#fff'}}>
              Sign Out
            </Text>
          </Button>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  safeArea: {
    flex: 1
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'space-between' // Sépare le contenu du bouton
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  titleText: {
    fontWeight: 'bold',
    marginBottom: 20 // Espacement entre le titre et la barre de recherche
  },
  signOutButton: {
    margin: 48,
    fontSize: 18,
    fontWeight: 'bold'
  },
});
