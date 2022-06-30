import React, { useEffect, useState } from "react";
import { View, Image, Text, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { User, ChatRoomUser } from "../chatRoomBackend/src/models";
import { DataStore, Auth } from "aws-amplify";


const ChatRoomHeader = ({ id }) => {
    const { width } = useWindowDimensions()
    // console.log('ChatRoomHeader-id, children',id)

    // const [users, setUsers] = useState<User[]>([])
    const [user, setUser] = useState<User|null>(null)

    useEffect(() => {
      if (!id) {
        return;
      } 
      const fetchUsers = async () => {
         // 聊天室的所有用户
        const fetchedUsers = (await DataStore.query(ChatRoomUser))
          .filter(ChatRoomUser => ChatRoomUser.chatRoom.id === id)
          .map(ChatRoomUser => ChatRoomUser.user)
        // setUsers(fetchedUsers)

        // 聊天室除登陆者外的第一个用户（展示用户）
        const authData =  await Auth.currentAuthenticatedUser()
        const user = fetchedUsers.find(users => users.id !== authData.attributes.sub) || null;
        setUser(user)
      }
      fetchUsers()
    }, [])

    return (
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        backgroundColor:'lightblue', 
        width: width - 48,
        marginLeft: -25,
        padding: 8,
        
      }}>
        <Image 
          source={{uri: user?.imageUrl}}
          style={{width: 30, height: 30, borderRadius: 15}}
        />
        <Text style={{flex: 1, marginLeft: 10, fontWeight: 'bold'}}>{user?.name}</Text>
        <Feather style={{marginHorizontal: 10}} name='camera' size={24} color="black" />
        <Feather style={{marginHorizontal: 10}} name='edit-2' size={24} color="black" />
      </View>
    )
}

export default ChatRoomHeader;