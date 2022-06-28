import React, { useState, useEffect } from 'react'
import { View, Image, Pressable, Text, StyleSheet, FlatList, } from 'react-native';

import NetInfo from '@react-native-community/netinfo';

import { DataStore, Hub } from 'aws-amplify';
import { User } from '../chatRoomBackend/src/models';

import UserItem from '../components/UserItem';


export default function UsersScreen() {

  const [users, setUsers] = useState<User[]>([]);

  // useEffect(() => {
  //   // 独立本地数据存储
  //   const fetchUsers = async () => {
  //     // await DataStore.delete(User, "10908")
  //     const fetchedUsers = await DataStore.query(User);
  //     console.log('fetchedUsers', fetchedUsers)
  //     setUsers(fetchedUsers);
  //   };
  //   fetchUsers();
  // }, []);

  useEffect(() => {
    DataStore.query(User).then(setUsers)
  }, [])
 
  return (
    <View style={styles.page}>
      <FlatList
        data={users}
        renderItem={({item}) => <UserItem user={item}/>}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: 'white',
    flex: 1,
  },
});
