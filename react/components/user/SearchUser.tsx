import { Text, TouchableOpacity, View, StyleSheet, SafeAreaView, FlatList, Image } from 'react-native';
import { useState } from 'react';
import { SearchBar } from '@/components/ui/searchbar';
import { searchApi } from '@/services/search.ts'
import { useAuth } from '@/contexts/authCtx';
import { Button } from '@/components/ui/button'
import { useProfile } from '@/contexts/profileCtx';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { UserItem } from '@/components/user/UserItem.tsx';


export default function SearchUser() {
  const { signOut } = useAuth();
  const { profile, updateProfile } = useProfile();
  const [currentUsername, setCurrentUsername] = useState('')
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);


  async function handleSearchSubmit(query) {
    console.log("handleSearchSubmit", query);
  }

  async function handleSearchChange(query) {
    const type = "user";
    setCurrentUsername(profile.username)

    if (query.trim()) {
      setIsLoading(true);
      try {
        const results = await searchApi(query, type);
        const usersArray = results?.data || [];
        const filteredUsers = usersArray.filter(user => user.username !== currentUsername);

        setUsers(filteredUsers);
      } catch (error) {
        console.error("Error during the research:", error);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setUsers([]);
    }
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.mainContainer}>
          <View style={styles.searchSection}>
            <Text style={styles.titleText}>
              Search for a friend
            </Text>
            <SearchBar
              onSubmit={handleSearchSubmit}
              onChangeText={handleSearchChange}
            />

            <View style={styles.listContainer}>
              {isLoading ? (
                <Text style={styles.loadingText}>Searching...</Text>
              ) : users.length > 0 ? (
                <FlatList
                  data={users}
                  keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                  renderItem={({ item }) => <UserItem item={item} />}
                  style={styles.userList}
                  showsVerticalScrollIndicator={false}
                />
              ) : <Text style={{textAlign: 'center'}}>User not found</Text>}
            </View>
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
    justifyContent: 'space-between'
  },
  searchSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50
  },
  titleText: {
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20
  },
  listContainer: {
    flex: 1,
    marginTop: 20
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 20
  },
  debugText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginTop: 10
  },
  userList: {
    flex: 1
  },
  signOutButton: {
    margin: 48,
    fontSize: 18,
    fontWeight: 'bold'
  }
});
