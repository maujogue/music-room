import { Text, TouchableOpacity, View, StyleSheet, SafeAreaView, FlatList, Image } from 'react-native';
import { useState } from 'react';
import { SearchBar } from '@/components/ui/searchbar';
import { searchApi } from '@/services/search.ts'
import { useAuth } from '@/contexts/authCtx';
import { Button } from '@/components/ui/button'
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function SearchUser() {
  const { signOut } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSearchSubmit(query) {
    console.log("handleSearchSubmit", query);
  }

  async function handleSearchChange(query) {
    const type = "user";

    if (query.trim()) {
      setIsLoading(true);
      try {
        const results = await searchApi(query, type);
        const userArray = results?.data || [];
        setUsers(userArray);
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

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {console.log(`Redirection to ${item.username}'s profile`)}}
    >
      <View style={styles.userItem}>
        <Image
          source={
            item?.avatar_url
              ? { uri: item.avatar_url }
              : require('../../assets/vibing.jpg')
          }
          style={styles.avatar}
          defaultSource={require('../../assets/vibing.jpg')}
        />
        <Text style={styles.userName}>{item.username}</Text>
      </View>
    </TouchableOpacity>
  );

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
                  renderItem={renderUserItem}
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
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    marginVertical: 5,
    borderRadius: 50,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
   avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#f0f0f0'
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  userDetails: {
    flex: 1
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  },
  userBio: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic'
  },
  addButton: {
    marginLeft: 'auto',
    borderRadius: 20,
  },
  signOutButton: {
    margin: 48,
    fontSize: 18,
    fontWeight: 'bold'
  }
});
