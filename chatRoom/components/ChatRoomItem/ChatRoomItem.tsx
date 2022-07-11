import React, { useState, useEffect } from 'react';
import { View, Image, Text, Pressable, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import styles from './styles';

import { Auth, DataStore } from 'aws-amplify';
import { ChatRoomUser, User, Message } from '../../chatRoomBackend/src/models';

import moment from "moment";

export default function ChatRoomItem({ chatRoom }) {

  const [users, setUsers] = useState<User[]>([]); // all users in this chatRoom
  const [displayUsers, setDisplayUsers] = useState<User[] | null>(null); // the display user 

  const [lastMessage, setLastMessage] = useState<Message | undefined>(undefined)


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
    const authData = await Auth.currentAuthenticatedUser()
    // 取第一个或前四个展示
    // fliter 一个包含所有通过测试函数的元素的新数组，若无 []
    // const user = fetchedUsers.filter(users => users.id !== authData.attributes.sub)[0]
    // find 通过测试函数的第一个元素的值，若无 undefined
    const users = fetchedUsers.filter(user => user.id !== authData.attributes.sub) || null;

    if(users?.length > 4) {
      setDisplayUsers(users.slice(0,4))
    } else {
      setDisplayUsers(users)
    }
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
      name: displayUsers && displayUsers.length > 1 ? chatRoom?.name : displayUsers[0].name
    })
  }

  // if (!displayUsers) {
  //   return <ActivityIndicator />
  // }

  const time = moment(lastMessage?.createdAt).from(moment())
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={{flexDirection: 'row', justifyContent: 'center',flexWrap:'wrap', width:50,height:50,marginRight: 10,overflow: 'hidden'}}>
      {
        displayUsers &&
        displayUsers.map(
          (user,index) => <Image key={index} source={{ uri: user.imageUri }} style={displayUsers.length > 1 ? styles.groupImage : styles.image}></Image>
          )
      }
      </View>
      {
        !!chatRoom.newMessage ?
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{chatRoom.newMessage}</Text>
          </View> : null
      }
      <View style={styles.rightContainer}>
        <View style={styles.row}>
          {/* <Text style={styles.name}>{displayUsers && displayUsers.length > 1 ? chatRoom?.name : displayUsers[0].name}</Text> */}
          <Text style={styles.text}>{time}</Text>
        </View>
        <Text numberOfLines={1} style={styles.text}>{lastMessage?.content}</Text>
      </View>
    </Pressable>
  )
}

