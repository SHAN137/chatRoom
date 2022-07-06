import React from 'react';
import { View, Image, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import styles from './styles';

import { Auth, DataStore } from 'aws-amplify';
import { ChatRoom, User, ChatRoomUser} from '../../chatRoomBackend/src/models';

export default function UserItem({ user }) {

    const navigation = useNavigation()


    const fetchComChatRoom = async(dbUser) => {
      // 共同聊天室
      const chatRoomUsers= (await DataStore.query(ChatRoomUser))
        .filter( item => item.user.id === user.id)
      const chatRoomAuthUsers = (await DataStore.query(ChatRoomUser))
        .filter( item => item.user.id === dbUser.id)

      const comChatRoom:any[] = []
      
      chatRoomUsers.forEach(element => {
        chatRoomAuthUsers.forEach(item => {
          if(item.chatRoom.id === element.chatRoom.id) {
            comChatRoom.push(item.chatRoom)
          }
        });
      });

      return comChatRoom
    }

    const fetchBothChatRoom = async (comChatRoom) => {
      // 只有两人的聊天室
      const bothChatRoom = comChatRoom.map( async (element) => {
        let comChatRoomUserNum = (await DataStore.query(ChatRoomUser))
          .filter( item => item.chatRoom.id === element.id)
          .length
        if (comChatRoomUserNum == 2) {
          return element
        }
      });

      return bothChatRoom[0]
    }

    const createNewChatRoom = async (dbUser) => {
      // 创建新的两人聊天室
      // N*user <- chatRoomUser -> N*chatRoom
      // Create a chatRoom
      const newChatRoom = await DataStore.save(new ChatRoom({newMessage: 0}));

      // Connect authenticated user with the new chatRoom
      await DataStore.save(new ChatRoomUser({
        user: dbUser,
        chatRoom: newChatRoom
      }))

      // Connect clicked user with the chatRoom
      await DataStore.save(new ChatRoomUser({
        user: user,
        chatRoom: newChatRoom
      }))

      return newChatRoom
    }

    const onPress = async () => {
      // if there is already a chatRoom between these two users
      // then redirect to the existing chat room 
      // otherwise, create a new chatRoom with these users

      const authUser = await Auth.currentAuthenticatedUser()
      const dbUser = await DataStore.query(User, authUser.attributes.sub)

      // 是否存在共同聊天室
      const comChatRoom = await fetchComChatRoom(dbUser)
      if (comChatRoom) {
        // 是否存在两人聊天室
        const bothChatRoom = await fetchBothChatRoom(comChatRoom)
        if (bothChatRoom) {
          navigation.navigate('ChatRoom', { id: bothChatRoom.id })
          // 需要 return，不然会继续运行下面代码
          return;
        }
      }
      
      // 之前不存在聊天室，创建新的两人聊天室
      const newChatRoom = await createNewChatRoom(dbUser)
      navigation.navigate('ChatRoom', { id: newChatRoom.id })
    }
    
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Image source={{ uri: user.imageUri }} style={styles.image}></Image>
      <View style={styles.rightContainer}>
        <View style={styles.row}>
          <Text style={styles.name}>{user.name}</Text>
        </View>
      </View>
    </Pressable>
  )
}

