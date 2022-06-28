import React, { useState, useEffect } from 'react'
import { View, Image, Pressable, Text, StyleSheet, FlatList, } from 'react-native';

import NetInfo from '@react-native-community/netinfo';

import { DataStore, Hub } from 'aws-amplify';
import { User } from '../chatRoomBackend/src/models';

import UserItem from '../components/UserItem';


export default function UsersScreen() {

  const [users, setUsers] = useState<User[]>([]);
  // const [users, setUsers] = useState([]);

  // const info = NetInfo.useNetInfo()
  //   console.log('NetInfo.isConnected:', info);

  useEffect(() => {
    // Create listener 查看网络状态是否处于活动状态
    // const listener = Hub.listen('datastore', async hubData => {
    //   await DataStore.start();
    //   const  { event, data } = hubData.payload;
    //   if (event === 'networkStatus') {
    //     console.log(`User has a network connection: ${data.active}`)
    //   }
    // })
    //获取设备是否具备网络连接对象: 包含三个函数：添加监听、移除监听、获取网络状态的函数
    // const info = NetInfo.useNetInfo()
    // console.log('NetInfo.isConnected:', info);
    // query the data when component mounts

    // DataStore.clear()
    // // 独立本地数据存储
    const fetchUsers = async () => {
      // await DataStore.delete(User, "10908")
      const fetchedUsers = await DataStore.query(User);
      console.log('fetchedUsers', fetchedUsers)
      setUsers(fetchedUsers);
    };
    fetchUsers();

    // Remove listener
    // listener();
  }, []);
 
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
