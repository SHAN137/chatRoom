import React, { useEffect, useState } from 'react';
import {View, StyleSheet, FlatList, SafeAreaView, ActivityIndicator} from 'react-native';

import Message from '../components/Messsge';
// import chatData from '../assets/SignalAssets/dummy-data/Chats';
import MessageInput from '../components/MessageInput';

import { useRoute, useNavigation } from '@react-navigation/core'

import { DataStore, SortDirection } from 'aws-amplify';
import { Message as MessageModel, ChatRoom } from '../chatRoomBackend/src/models';


export default function ChatRoomScreen() {
    const [messages, setMessages] = useState<MessageModel[]>([])
    const [chatRoom, setChatRoom] = useState<ChatRoom|null>(null)
    const [messageReplyto, setMessageReplyTo] = useState<MessageModel|null>(null)

    const route = useRoute();
    const navigation = useNavigation();

    // 这里设置会报 warning，改成了用路由给头部传参
    // Cannot update a component (`NativeStackNavigator`) while rendering a different component (`ChatRoomScreen`), To locate the bad setState() call inside `ChatRoomScreen`
    // navigation.setOptions({title: 'shsna'})

    useEffect(() => {
        fetchChatRoom()
    }, [])

    useEffect(() => {
        fetchMessages()
    }, [chatRoom])

    useEffect(() => {
        const subscription = DataStore.observe(MessageModel).subscribe(msg => {
            if (msg.model === MessageModel && msg.opType === 'INSERT') {
                setMessages(existingMessage => [...existingMessage, msg.element])
            }
        });

        // component will unmount
        return () => subscription.unsubscribe()
    }, [])

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
        }
    }

    const fetchMessages = async () => {
        if (!chatRoom) {
            return
        }
        const fetchedMessages = await DataStore.query(MessageModel, 
            message => message.chatroomID("eq", chatRoom?.id),
            {
                sort: messages => messages.createdAt(SortDirection.ASCENDING)
            }
        )
        setMessages(fetchedMessages)
    }

    // if(chatRoom?.id) {
    //     return <ActivityIndicator />
    // }

    return (
        <SafeAreaView style={styles.page}>
            <FlatList
                data={messages}
                renderItem={({ item }) => 
                    <Message 
                        message={item} 
                        setMessageReplyTo={()=>setMessageReplyTo(item)}
                />} 
                style={{'backgroundColor': 'red'}}
                // inverted={true}
            />
            <MessageInput 
                chatRoom={ chatRoom } 
                messageReplyTo={messageReplyto}
                removeMessageReplyTo={() => setMessageReplyTo(null)}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    page: {
        backgroundColor: 'white',
        flex: 1,
    }
})