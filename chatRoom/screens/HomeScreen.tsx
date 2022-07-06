import React, { useState, useEffect } from 'react'

import { View, Image, Pressable, Text, StyleSheet, FlatList } from 'react-native';

import ChatRoomItem from '../components/ChatRoomItem';

import { Auth, DataStore } from 'aws-amplify'; 
import { ChatRoom, ChatRoomUser } from '../chatRoomBackend/src/models';

export default function HomeScreen() {

  const logout = () => {
    // Can't perform a React state update on an unmounted component.
    Auth.signOut()
  }
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);

  useEffect(()=>{
    
    const fetchChatRooms = async () => {
      const authData =  await Auth.currentAuthenticatedUser()

      const chatRooms = (await DataStore.query(ChatRoomUser))
        .filter(ChatRoomUser => ChatRoomUser.user.id === authData.attributes.sub)
        .map(ChatRoomUser => ChatRoomUser.chatRoom)

      setChatRooms(chatRooms)
      // console.log('chatRooms', chatRooms)
    }
    fetchChatRooms()
  }, [])

  return (
    <View style={styles.page}>
      <FlatList
        data={chatRooms}
        renderItem={({item}) => <ChatRoomItem chatRoom={item}/>}
        showsVerticalScrollIndicator={false}
      />
      {/* logout */}
      <Pressable onPress={logout} style={{backgroundColor: 'lightblue', height: 50, margin: 10, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: 'white',
    flex: 1,
  },
});
