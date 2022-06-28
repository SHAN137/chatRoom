import React from 'react';
import { View, Image, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import styles from './styles';

import { Auth, DataStore } from 'aws-amplify';
import { ChatRoom, User, ChatRoomUser} from '../../chatRoomBackend/src/models';

export default function UserItem({ user }) {

    const navigation = useNavigation()

    const onPress = async () => {
      // if there is already a chatRoom between these two users
      // then redirect to the existing chat room 
      // otherwise, create a new chatRoom with these users
      // await DataStore.query(ChatRoomUser,  )


      // N*user <- chatRoomUser -> N*chatRoom
      // Create a chatRoom
      const newChatRoom = await DataStore.save(new ChatRoom({newMessage: 0}));

      // Connect authenticated user with the new chatRoom
      const authUser = await Auth.currentAuthenticatedUser()
      const dbUser = await DataStore.query(User, authUser.attributes.sub)
      console.log('authUser',authUser)
      await DataStore.save(new ChatRoomUser({
        user: dbUser,
        chatRoom: newChatRoom
      }))

      // Connect clicked user with the chatRoom
      await DataStore.save(new ChatRoomUser({
        user: user,
        chatRoom: newChatRoom
      }))
       
      navigation.navigate('ChatRoom', { id: newChatRoom.id })
    }
    
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Image source={{ uri: user.imageUrl }} style={styles.image}></Image>
      <View style={styles.rightContainer}>
        <View style={styles.row}>
          <Text style={styles.name}>{user.name}</Text>
        </View>
      </View>
    </Pressable>
  )
}

