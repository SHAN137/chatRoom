import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, useWindowDimensions, Pressable } from 'react-native';

import { DataStore, Auth, Storage } from 'aws-amplify';
import { User } from '../../chatRoomBackend/src/models';

import { S3Image } from 'aws-amplify-react-native';
import AudioPlayer from '../AudioPlayer';

import { Ionicons } from '@expo/vector-icons';

import { Message as MessageModel } from '../../chatRoomBackend/src/models';
import MessageReply from '../MesssgeReply';

export default function Message(props) {
    const { setMessageReplyTo, message: propsMessage, } = props 

    const [message, setMessage] = useState<MessageModel>(props.message)
    const [user, setUser] = useState<User | undefined>()
    const [isMe, setIsMe] = useState<boolean | null>(null)
    const [soundUri, setSoundUri] = useState<string|null> (null)
    const [repliedTo, setRepliedTo] = useState<MessageModel|null>(null)

    const { width } = useWindowDimensions()

    // prop 变化时 message 跟着更新
    useEffect(() => {
        setMessage(propsMessage)
    }, [propsMessage])

    useEffect(() => {
        DataStore.query(User, message.userID).then(setUser)
    }, [])

    useEffect(() => {
        const checkIsMe = async () => {
            if (!user) {
                return
            }
            const authData = await Auth.currentAuthenticatedUser()
            setIsMe(user.id === authData.attributes.sub)
        }
        checkIsMe()
    }, [user])

    useEffect(() => {
        if(message?.audioKey) {
            downloadSound()
        }

        if(message?.replyToMessageID) {
            fetchMessageReply()
        }
    }, [message])

    useEffect(() => {
        // 监听消息有无被更改
        const subscription = DataStore.observe(MessageModel, message.id).subscribe(msg => {
            if (msg.model === MessageModel && msg.opType === 'UPDATE') {
                setMessage((message) => {return {...message, ...msg.element}})
            }
        });

        // component will unmount
        return () => subscription.unsubscribe()
    }, [])

    useEffect(() => {
        setAsRead()
    }, [isMe, message])

    const setAsRead = () => {
        if(isMe === false && message.status === 'DELIVERED') {
            DataStore.save(
                MessageModel.copyOf(message, updated => {
                  updated.status = 'READ'
                })
              )
        }
    }

    const downloadSound = async () => {
        const uri = await Storage.get(message.audioKey);
        setSoundUri(uri)
    }

    const fetchMessageReply = async () => {
        DataStore.query(MessageModel, message.replyToMessageID).then(setRepliedTo)
    }
   
    return (
        <View>
            <Pressable 
                onLongPress={setMessageReplyTo}
                style={[
                    styles.containter, 
                    isMe ? styles.rightContainer : styles.leftContainer, 
                    { marginBottom: repliedTo ? 5 : 10}, 
                ]}
            >
                {
                    isMe && !!message.status && message.status !== 'SENT' &&
                    <Ionicons 
                        name={message.status === 'DELIVERED' ? 'checkmark' : 'checkmark-done'} 
                        size={16} 
                        color="grey" 
                        style={{ marginHorizontal: 5}}
                    />
                }
                <View style={[
                    { padding: 10, borderRadius: 15 },
                    isMe ? {backgroundColor: '#3872E9'} : {backgroundColor: 'lightgrey'},
                    {width: message.audioKey ? '90%' : 'auto'}
                ]}>
                { 
                    !!message.imageKey && (
                    <View style={{ marginBottom: !message.content ? 0 : 10 }}>
                        <S3Image 
                            imgKey={message.imageKey} 
                            style={{width: width * 0.5, aspectRatio: 4/3}}
                            resizeMode="contain"
                        />
                    </View>
                )}
                {
                    !! message.audioKey && (
                    <View style={{ marginBottom: !message.content ? 0 : 10 }}>
                        <AudioPlayer soundUri={soundUri}/>
                    </View>
                )}
                { 
                    !!message.content &&
                    <View style={{alignItems: 'flex-end'}}>
                        <Text style={{ color: isMe ? 'white' : 'black' }}>{message.content}</Text>
                    </View> 
                }
                </View>       
            </Pressable>
            {
                !!repliedTo &&
                <View style={[
                    styles.containterReply,
                    isMe ? styles.rightContainer : styles.leftContainer,
                ]}>
                    <MessageReply message={repliedTo} status={'MESSAGE'}/>
                </View> 
            }
        </View>    
    )
}

const styles = StyleSheet.create({
    containter: {
        maxWidth: '75%',
        margin: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    leftContainer: {
        marginLeft: 10,
        marginRight: 'auto'
    },
    rightContainer: {
        backgroundColor: 'lightgrey',
        marginLeft: 'auto',
        marginRight: 10
    },
    containterReply: {
        maxWidth: '75%',
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
})