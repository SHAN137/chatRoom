import React, { useEffect, useState } from 'react';
import {View, StyleSheet, FlatList, SafeAreaView, ActivityIndicator} from 'react-native';

import Message from '../components/Messsge';
// import chatData from '../assets/SignalAssets/dummy-data/Chats';
import MessageInput from '../components/MessageInput';

import { useRoute, useNavigation } from '@react-navigation/core'

import { DataStore } from 'aws-amplify';
import { Message as MessageModel, ChatRoom } from '../chatRoomBackend/src/models';


export default function ChatRoomScreen() {
    const [messages, setMessages] = useState<MessageModel[]>([])
    const [chatRoom, setChatRoom] = useState<ChatRoom|null>(null)

    const route = useRoute();
    const navigation = useNavigation();

    console.log("route", route.params ? route.params.id : 'no')
    // 这里设置会报 warning
    // Cannot update a component (`NativeStackNavigator`) while rendering a different component (`ChatRoomScreen`), To locate the bad setState() call inside `ChatRoomScreen`
    // navigation.setOptions({title: 'shsna'})

    useEffect(() => {
        fetchChatRoom()
    }, [])

    useEffect(() => {
        fetchMessages()
    }, [chatRoom])

    const fetchChatRoom = async () => {
        if(!route.params?.id){
            console.warn("No chatRoom id provided")
            return
        }

        // executed on the database side
        const fetchedChatRoom = await DataStore.query(ChatRoom, route.params.id)
        if (!fetchedChatRoom){
            console.warn("Couldn't find a chatRoom with this id")
            return
        } else {
            setChatRoom(fetchedChatRoom)
            // console.log('fetchedChatRoom',fetchedChatRoom)
        }
    }

    const fetchMessages = async () => {
        console.log('fetchMessages111',chatRoom )
        if (!chatRoom) {
            return
        }
        const fetchedMessages = await DataStore.query(MessageModel, 
            message => message.chatroomID("eq", chatRoom?.id)
        )
        console.log('fetchedMessages2222',fetchedMessages)
        setMessages(fetchedMessages)
    }

    // if(chatRoom) {
    //     return <ActivityIndicator/>
    // }
    
    return (
        <SafeAreaView style={styles.page}>
            <FlatList
                data={messages}
                renderItem={({ item }) => <Message message={item}/>} 
                style={{'backgroundColor': 'red'}}
                inverted={true}
            />
            <MessageInput chatRoomId={ chatRoom?.id }/>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    page: {
        backgroundColor: 'white',
        flex: 1,
    }
})