import React from 'react';
import {View, StyleSheet, FlatList, SafeAreaView} from 'react-native';

import Message from '../components/Messsge';
import chatData from '../assets/SignalAssets/dummy-data/Chats';
import MessageInput from '../components/MessageInput';

import { useRoute, useNavigation } from '@react-navigation/core'

export default function ChatRoomScreen() {
    const route = useRoute();
    const navigation = useNavigation();

    // console.log("sa", route.params ? route.params.id : 'no')r
    // 这里设置会报 warning
    // Cannot update a component (`NativeStackNavigator`) while rendering a different component (`ChatRoomScreen`), To locate the bad setState() call inside `ChatRoomScreen`
    // navigation.setOptions({title: 'shsna'})

    return (
        <SafeAreaView style={styles.page}>
            <FlatList
                data={chatData.messages}
                renderItem={({ item }) => <Message message={item}/>} 
                style={{'backgroundColor': 'red'}}
                inverted={true}
            />
            <MessageInput/>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    page: {
        backgroundColor: 'white',
        flex: 1,
    }
})