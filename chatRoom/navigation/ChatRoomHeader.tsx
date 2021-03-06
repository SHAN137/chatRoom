import React, { useEffect, useState } from "react";
import { View, Image, Text, useWindowDimensions,StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { User, ChatRoomUser, ChatRoom } from "../chatRoomBackend/src/models";
import { DataStore, Auth } from "aws-amplify";
import moment from "moment";
import { useNavigation } from "@react-navigation/native";


const ChatRoomHeader = ({ id }) => {
    const { width } = useWindowDimensions()
    const navigation = useNavigation()
  
    // const [users, setUsers] = useState<User[]>([])
    // 两人聊天室
    const [user, setUser] = useState<User|null>(null)
    // 多人聊天室
    const [displayUsers, setDisplayUsers] = useState<User[]>([])
    // 聊天室
    const [chatRoom, setChatRoom] = useState<ChatRoom|null>(null)

    useEffect(() => {
      if (!id) {
        return;
      } 
      fetchUsers()
    }, [])

    const fetchUsers = async () => {
      // 聊天室的所有用户
      const fetchedChatRoomUser = (await DataStore.query(ChatRoomUser))
        .filter(ChatRoomUser => ChatRoomUser.chatRoom.id === id)
        
      setChatRoom(fetchedChatRoomUser[0].chatRoom)

      const fetchedUsers = fetchedChatRoomUser.map(ChatRoomUser => ChatRoomUser.user)

      // 聊天室除登陆者外的其他用户（展示用户）
      const authData =  await Auth.currentAuthenticatedUser()
      const users = fetchedUsers.filter(users => users.id !== authData.attributes.sub) || null;

      if(users?.length > 4) {
        setDisplayUsers(users.slice(0,4))
      } else if(users?.length > 1){
        setDisplayUsers(users)
      } else {
        setUser(users[0])
      }
    }

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

    const toGroupInfo = () => {
      navigation.navigate('GroupInfo', {id: id})
    } 

    return (
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        width: width - 48,
        marginLeft: -25,
        padding: 8,
        
      }}>
        
        {
          displayUsers.length > 1 &&
            <View style={{flexDirection: 'row', position: 'relative', width: displayUsers.length * 20}}>
            { 
              displayUsers.map(
                (user,index) => <Image source={{ uri: user.imageUri }} style={[styles.groupImage, {left: index * 18}]} key={index} />
            )}
            </View>
        }
        {
          displayUsers.length > 1 &&
            <Pressable onPress={toGroupInfo} style={{flex: 1, marginLeft: 10}}>
              <Text style={{fontWeight: 'bold'}}>{chatRoom?.name}</Text>
            </Pressable>
        }
        {
          user && 
          <Image 
            source={{uri: user?.imageUri}}
            style={styles.image}
          />
        }
        {
          user && 
          <View style={{flex: 1, marginLeft: 10}}>
            <Text style={{fontWeight: 'bold'}}>{user?.name}</Text>
            <Text style={{}}>{getLastOnlineAtText()}</Text>
          </View>
        }
      </View>
    )
}
const styles = StyleSheet.create({
  image: {
    width: 30, 
    height: 30, 
    borderRadius: 15,
    zIndex: 20,
  },
  groupImage: {
    width: 30, 
    height: 30, 
    borderRadius: 15,
    position: "absolute", 
    top: -15,
    backgroundColor: 'pink'
  },
})

export default ChatRoomHeader;