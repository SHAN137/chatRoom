import * as React from 'react'

import { View, Image, Text, StyleSheet, FlatList } from 'react-native';

import ChatRoomItem from '../components/ChatRoomItem';

import ChatRoomDate from '../assets/SignalAssets/dummy-data/ChatRooms';


export default function TabOneScreen() {
  return (
    <View style={styles.page}>
      <FlatList
        data={ChatRoomDate}
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
  },
});
