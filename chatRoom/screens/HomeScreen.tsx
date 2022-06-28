import * as React from 'react'

import { View, Image, Pressable, Text, StyleSheet, FlatList } from 'react-native';

import ChatRoomItem from '../components/ChatRoomItem';

import ChatRoomDate from '../assets/SignalAssets/dummy-data/ChatRooms';

import { Auth } from 'aws-amplify'; 

export default function HomeScreen() {

  const logout = () => {
    console.log('logout')
    // Can't perform a React state update on an unmounted component.
    Auth.signOut()
  }

  return (
    <View style={styles.page}>
      <FlatList
        data={ChatRoomDate}
        renderItem={({item}) => <ChatRoomItem chatRoom={item}/>}
        showsVerticalScrollIndicator={false}
      />
      {/* logout */}
      {/* <Pressable onPress={logout} style={{backgroundColor: 'lightblue', height: 50, margin: 10, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Logout</Text>
      </Pressable> */}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: 'white',
    flex: 1,
  },
});
