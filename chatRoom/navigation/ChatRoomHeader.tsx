import React, { useEffect, useState } from "react";
import { View, Image, Text, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { User, ChatRoomUser } from "../chatRoomBackend/src/models";
import { DataStore, Auth } from "aws-amplify";
import moment from "moment";


const ChatRoomHeader = ({ id }) => {
    const { width } = useWindowDimensions()
  
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

    const getLastOnlineAtText = () => {
      if(!user?.lastOnlineAt) {
        return null;
      }

      // if lastOnline is less than 5 minutes ago, show him as online
      const diffMS = moment().diff(moment(user.lastOnlineAt))
      const fiveMIN = 5 * 60 * 1000
      if(diffMS <= fiveMIN) {
        return "ONLINE";
      } else {
        return `${ moment(user?.lastOnlineAt).fromNow() }`
      }
    }

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
          source={{uri: user?.imageUri}}
          style={{width: 30, height: 30, borderRadius: 15}}
        />
        <View style={{flex: 1, marginLeft: 10}}>
          <Text style={{fontWeight: 'bold'}}>{user?.name}</Text>
          <Text style={{}}>{getLastOnlineAtText()}</Text>
        </View>
        <Feather style={{marginHorizontal: 10}} name='camera' size={24} color="black" />
        <Feather style={{marginHorizontal: 10}} name='edit-2' size={24} color="black" />
      </View>
    )
}

export default ChatRoomHeader;