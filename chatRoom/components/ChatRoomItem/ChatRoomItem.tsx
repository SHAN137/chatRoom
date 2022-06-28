import React, { useState, useEffect } from 'react';
import { View, Image, Text, Pressable, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import styles from './styles';

import { Auth, DataStore } from 'aws-amplify';
import { ChatRoomUser, User } from '../../chatRoomBackend/src/models';

export default function ChatRoomItem({ chatRoom }) {

    const [users, setUsers] = useState<User[]>([]); // all users in this chatRoom
    const [user, setUser] = useState<User|null>(null); // the display user 


    const navigation = useNavigation()

    useEffect(() => {
      

      const fetchUsers = async () => {
        const fetchedUsers = (await DataStore.query(ChatRoomUser))
          .filter(ChatRoomUser => ChatRoomUser.chatRoom.id === chatRoom.id)
          .map(ChatRoomUser => ChatRoomUser.user)
        setUsers(fetchedUsers)

        const authData =  await Auth.currentAuthenticatedUser()
        // 取第一个展示 
        // fliter 一个包含所有通过测试函数的元素的新数组，若无 []
        // const user = fetchedUsers.filter(users => users.id !== authData.attributes.sub)[0]
        // find 通过测试函数的第一个元素的值，若无 undefined
        const user = fetchedUsers.find(users => users.id !== authData.attributes.sub) || null;
        console.log('user', user)
        setUser(user)
      }
      fetchUsers()
    }, [])

    const onPress = () => {
      // 尽量在这少传数据
      navigation.navigate('ChatRoom', { 
        id: chatRoom.id,
        name: user.name
      })
    }

    if(!user) {
      return <ActivityIndicator/>
    }
     
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Image source={{ uri: user.imageUrl }} style={styles.image}></Image>
      {
        !!chatRoom.newMessage ?
        <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{chatRoom.newMessage}</Text>
        </View> : null
      }
      <View style={styles.rightContainer}>
        <View style={styles.row}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.text}>{chatRoom.lastMessage?.createdAt}</Text>
        </View>
        <Text numberOfLines={1} style={styles.text}>{chatRoom.lastMessage?.content}</Text>
      </View>
    </Pressable>
  )
}

