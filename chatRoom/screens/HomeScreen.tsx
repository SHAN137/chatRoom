import React, { useState, useEffect } from 'react'

import { View, StyleSheet, FlatList } from 'react-native';

import ChatRoomItem from '../components/ChatRoomItem';

import { Auth, DataStore } from 'aws-amplify'; 
import { ChatRoom, ChatRoomUser } from '../chatRoomBackend/src/models';

export default function HomeScreen() {

 
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);

  useEffect(()=>{
    
    const fetchChatRooms = async () => {
      const authData =  await Auth.currentAuthenticatedUser()

      const chatRooms = (await DataStore.query(ChatRoomUser))
        .filter(ChatRoomUser => ChatRoomUser.user?.id === authData.attributes?.sub)
        .map(ChatRoomUser => ChatRoomUser.chatRoom)

      setChatRooms(chatRooms)
    }
    fetchChatRooms()
  }, [])

  return (
    <View style={styles.page}>
      <FlatList
        data={chatRooms}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => <ChatRoomItem chatRoom={item}/>}
        showsVerticalScrollIndicator={false}
      />
      
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: 'white',
    flex: 1,
    overflow: 'hidden'
  },
});
