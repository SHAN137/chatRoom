import React, { useState, useEffect } from 'react'
import { View, Image, Pressable, Text, StyleSheet, FlatList, } from 'react-native';

import UserItem from '../components/UserItem';

import { useNavigation } from '@react-navigation/native';
import { Auth, DataStore } from 'aws-amplify';
import { ChatRoom, User, ChatRoomUser} from '../chatRoomBackend/src/models';

import GroupButton from '../components/GroupButton';


export default function UsersScreen() {

  const [users, setUsers] = useState<User[]>([]);
  const [isNewGroup, setIsNewGroup] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User[]>([]);

  const navigation = useNavigation()

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const fetchedUsers = await DataStore.query(User)
    const authUser = await Auth.currentAuthenticatedUser()
    const users = fetchedUsers.filter((item) => item.id !== authUser.attributes.sub)
    setUsers(users)
  };

  const fetchComChatRoom = async(dbUser,user) => {

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

  const createNewChatRoom = async (dbUser, selectedUsers) => {
    // 创建新的两人/多人聊天室
    // N*user <- chatRoomUser -> N*chatRoom
    // Create a chatRoom

    let chatRoomObj = {
      newMessage: 0,
    }
    if(selectedUsers.length > 1) {
      chatRoomObj = {
        ...chatRoomObj, 
        name: 'group',
        Admin: dbUser,
      }
    }
    const newChatRoom = await DataStore.save(new ChatRoom(chatRoomObj));

    // Connect authenticated user with the new chatRoom
    if(dbUser && newChatRoom) {
      await connectUserToChatRoom({newChatRoom, user: dbUser})
    }
    
    // Connect clicked user with the chatRoom
    await Promise.all(
      selectedUsers.map((user)=>connectUserToChatRoom({newChatRoom, user}))
    )

    return newChatRoom
  }

  const connectUserToChatRoom = async({newChatRoom, user})=>{
    await DataStore.save(new ChatRoomUser({
      user: user,
      chatRoom: newChatRoom
    }))
  }

  const toChatRoom = async (selectedUsers) => {
    // if there is already a chatRoom between these two users
    // then redirect to the existing chat room 
    // otherwise, create a new chatRoom with these users

    const authUser = await Auth.currentAuthenticatedUser()
    const dbUser = await DataStore.query(User, authUser.attributes.sub)

    // 只有人数为 2 时才验证
    if(!isNewGroup || selectedUsers.length === 1) {
      // 是否存在共同聊天室
      const comChatRoom = await fetchComChatRoom(dbUser,selectedUsers[0])
      if (comChatRoom) {
        // 是否存在两人聊天室
        const bothChatRoom = await fetchBothChatRoom(comChatRoom)
        if (bothChatRoom) {
          navigation.navigate('ChatRoom', { id: bothChatRoom.id })
          // 需要 return，不然会继续运行下面代码
          return;
        }
      } 
    }
    
    // 之前不存在聊天室，创建新的两人/多人聊天室
    const newChatRoom = await createNewChatRoom(dbUser, selectedUsers)
    navigation.navigate('ChatRoom', { id: newChatRoom.id })
  }

  const onUserPress = async(user) => {
    if(isNewGroup) {
      if(isSelectedUser(user)) {
        const fliterArr = selectedUser.filter((item) => user.id !== item.id)
        setSelectedUser(fliterArr)
      }else {
        setSelectedUser([...selectedUser,user])
      }
      
    } else {

      await toChatRoom([user])
    }
  }
 
  const isSelectedUser = (user) => {
    return selectedUser.some((item)=>item.id=== user.id)
  }

  const saveGroup = async() => {
    setIsNewGroup(false)
    await toChatRoom(selectedUser)
  }

  const onGroupButtonPress = () => {
    setIsNewGroup(!isNewGroup)
    setSelectedUser([])
  }

  return (
    <View style={styles.page}>
      <FlatList
        data={users}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => 
          <UserItem 
            user={item} 
            onPress={() => onUserPress(item)}
            isSeleted={isNewGroup ? isSelectedUser(item): null}
        />}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<GroupButton onPress={onGroupButtonPress}/>}
      />
      {
        isNewGroup &&
          <Pressable style={styles.iconContainer} onPress={saveGroup}>
            <Text style={styles.text}>{` 创建群组（${selectedUser.length}）`}</Text>
          </Pressable>
      }
    </View>
  );
}


const styles = StyleSheet.create({
  page: {
    backgroundColor: 'white',
    flex: 1,
    alignItems: 'stretch',
  },
  itemContainer: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center'
  },
  iconContainer: {
    flexDirection: 'row',
    backgroundColor: 'lightblue',
    justifyContent: 'center',
    alignItems: "center",
    borderRadius: 10,
    height: 50,
    marginHorizontal: 10,
  },
  text: {
      fontWeight: 'bold',
      marginHorizontal: 10,
      fontSize: 20,
      color: 'grey',
  },
  
});
