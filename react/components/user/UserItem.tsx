import React from 'react';
import { useState } from 'react';
import { TouchableOpacity, View, Image, Text, StyleSheet } from 'react-native';
import { Button } from '@/components/ui/button'
import { UserInfo } from '@/types/user'

type UserItemProps = {
  user: UserInfo;
  handlePress?: () => void;
};

export function UserItem({ user, handlePress }: UserItemProps) {
  const [isFollowed, setIsFollowed] = useState(false);

  return (
    <TouchableOpacity
      onPress={() => handlePress?.()}>
      <View style={styles.userItem}>
        <Image
          source={
            user?.avatar_url
              ? { uri: user.avatar_url }
              : require('../../assets/vibing.jpg')
          }
          style={styles.avatar}
          defaultSource={require('../../assets/vibing.jpg')}
        />
        <Text style={styles.userName}>{user.username}</Text>
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
