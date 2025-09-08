import React from 'react';
import { TouchableOpacity, View, Image, Text, StyleSheet } from 'react-native';
import { Button } from '@/components/ui/button'

export function UserItem({ item }) {
  return (
    <TouchableOpacity
      onPress={() => console.log(`Redirection to ${item.username}'s profile`)}>
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
        <Button
          style={styles.addButton}
          onPress={() => console.log("Follow button")}>

            <Text style={{color: '#fff'}}>follow</Text>
        </Button>
      </View>
    </TouchableOpacity>
  );
}


const styles = StyleSheet.create({
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
    userName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333'
    },
    addButton: {
      borderRadius: 50,
      marginLeft: 'auto',
      color: '#f0f0f0'
    }
})
