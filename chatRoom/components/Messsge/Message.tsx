import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, useWindowDimensions, Pressable, Alert } from 'react-native';

import { DataStore, Auth, Storage } from 'aws-amplify';
import { User } from '../../chatRoomBackend/src/models';

import { S3Image } from 'aws-amplify-react-native';
import AudioPlayer from '../AudioPlayer';

import { Ionicons } from '@expo/vector-icons';

import { Message as MessageModel } from '../../chatRoomBackend/src/models';
import MessageReply from '../MesssgeReply';

import { useActionSheet } from '@expo/react-native-action-sheet';

import { box } from 'tweetnacl';
import { stringToUint8Array, decrypt, getAuthPrivateKey} from '../../utils/crypto';
import { useNavigation } from '@react-navigation/native';

export default function Message(props) {
    const { setMessageReplyTo, message: propsMessage, } = props 

    const [message, setMessage] = useState<MessageModel>(props.message)
    const [user, setUser] = useState<User | undefined>()
    const [isMe, setIsMe] = useState<boolean | null>(null)
    const [soundUri, setSoundUri] = useState<string|null> (null)
    const [repliedTo, setRepliedTo] = useState<MessageModel|null>(null)
    const [isDelete, setIsDelete] = useState(null)
    const [decryptedContent, setDecryptedContent] = useState('')

    const { width } = useWindowDimensions()
    const { showActionSheetWithOptions } = useActionSheet()
    const navigation = useNavigation()

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
        if(message?.content && user?.publicKey) {
            decryptContent()
        }
    }, [message, user])

    useEffect(() => {
        // 监听消息有无被更改
        const subscription = DataStore.observe(MessageModel, message.id).subscribe(msg => {
            if (msg.model === MessageModel) {
                if (msg.opType === 'UPDATE') {
                    setMessage((message) => {return {...message, ...msg.element}})
                } else if (msg.opType === 'DELETE' && msg.element.id === message.id) {
                    setIsDelete(true)
                }
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
   
    const openActionMenu = () => {
        const options = ["引用"]
        if(isMe) {
            options.push("删除")
        }
        options.push("取消")
        const destructiveButtonIndex = 1;
        const cancelButtonIndex = 2;
        
        showActionSheetWithOptions(
            {
                options,
                destructiveButtonIndex,
                cancelButtonIndex,
            },
            onActionPress
        )
    }

    const onActionPress = (index) => {
        if(index === 0) {
            setMessageReplyTo()
        }else if(index === 1) {
            if(!isMe) {
                return;
            }
            confirmDelete()
        }
    }

    const confirmDelete = () => {
        Alert.alert(
            '删除',
            `确认从该群组删除此消息`,
            [
                {text: '确定', style: 'destructive', onPress: () => deleteMessage()},
                {text: '取消', onPress: () => {}},
            ],
            {
                cancelable: true,
            }
        );
    }

    const deleteMessage = async() => {
        await DataStore.delete(message)
    }

    const decryptContent = async() => {
        
        const privateKey = await getAuthPrivateKey()
        if(!privateKey) {
            Alert.alert(
                '你还没设置秘钥',
                '需要去设置页面生成',
                [{
                    text: '设置',
                    onPress: () => {navigation.navigate('Setting')},
                }]
            )
            return;
        }
        
        const sharedB = box.before(
            stringToUint8Array(user.publicKey),
            privateKey
        );

        const decrypted = decrypt(sharedB, message.content);
        setDecryptedContent(decrypted.message)
    }

    return (
        <View>
            <Pressable 
                onLongPress={openActionMenu}
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
                    <View style={{ marginBottom: !decryptedContent? 0 : 10 }}>
                        <S3Image 
                            imgKey={message.imageKey} 
                            style={{width: width * 0.5, aspectRatio: 4/3}}
                            resizeMode="contain"
                        />
                    </View>
                )}
                {
                    !! message.audioKey && (
                    <View style={{ marginBottom: !decryptedContent ? 0 : 10 }}>
                        <AudioPlayer soundUri={soundUri}/>
                    </View>
                )}
                { 
                    (!!decryptedContent || isDelete) &&
                    <View style={{alignItems: 'flex-end'}}>
                        <Text style={{ color: isMe ? 'white' : 'black' }}>{isDelete ? '消息已删除' : decryptedContent}</Text>
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