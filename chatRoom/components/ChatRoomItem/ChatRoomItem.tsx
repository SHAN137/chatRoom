import React, { useState, useEffect } from 'react';
import { View, Image, Text, Pressable, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import styles from './styles';

import { Auth, DataStore } from 'aws-amplify';
import { ChatRoomUser, User, Message } from '../../chatRoomBackend/src/models';

import moment from "moment";

export default function ChatRoomItem({ chatRoom }) {

  const [users, setUsers] = useState<User[]>([]); // all users in this chatRoom
  const [user, setUser] = useState<User|null>(null); // the display user 

  const [lastMessage, setLastMessage] = useState<Message|undefined>(undefined)


  const navigation = useNavigation()

  useEffect(() => {
    // 用户
    fetchUsers()
    // 信息
    fetchLastMessage()

  }, [])

  const fetchUsers = async () => {
    // 聊天室的所有用户
    const fetchedUsers = (await DataStore.query(ChatRoomUser))
      .filter(ChatRoomUser => ChatRoomUser.chatRoom.id === chatRoom.id)
      .map(ChatRoomUser => ChatRoomUser.user)
    setUsers(fetchedUsers)

    // 聊天室除登陆者外的第一个用户（展示用户）
    const authData =  await Auth.currentAuthenticatedUser()
    // 取第一个展示 
    // fliter 一个包含所有通过测试函数的元素的新数组，若无 []
    // const user = fetchedUsers.filter(users => users.id !== authData.attributes.sub)[0]
    // find 通过测试函数的第一个元素的值，若无 undefined
    const user = fetchedUsers.find(users => users.id !== authData.attributes.sub) || null;
    setUser(user)
  }

  const fetchLastMessage = async () => {
    if (!chatRoom.chatRoomLastMessageId) {
      return
    }
    DataStore.query(Message, chatRoom.chatRoomLastMessageId).then(setLastMessage)
  }

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

  const time = moment(lastMessage?.createdAt).from(moment())
     
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Image source={{ uri: user.imageUri }} style={styles.image}></Image>
      {
        !!chatRoom.newMessage ?
        <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{chatRoom.newMessage}</Text>
        </View> : null
      }
      <View style={styles.rightContainer}>
        <View style={styles.row}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.text}>{time}</Text>
        </View>
        <Text numberOfLines={1} style={styles.text}>{lastMessage?.content}</Text>
      </View>
    </Pressable>
  )
}

