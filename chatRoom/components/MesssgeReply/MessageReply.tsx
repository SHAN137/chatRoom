import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, useWindowDimensions, Pressable } from 'react-native';

import { DataStore, Auth, Storage } from 'aws-amplify';
import { User } from '../../chatRoomBackend/src/models';

import { S3Image } from 'aws-amplify-react-native';
import AudioPlayer from '../AudioPlayer';

import { Ionicons } from '@expo/vector-icons';

import { Message as MessageModel } from '../../chatRoomBackend/src/models';

export default function MessageReply(props) {
    const { status: propsStatus, message: propsMessage } = props

    const [message, setMessage] = useState<MessageModel>(propsMessage)
    const [status, setStatus] = useState<string>(propsStatus)
    const [user, setUser] = useState<User | undefined>()
    const [soundUri, setSoundUri] = useState<string | null>(null)

    const { width } = useWindowDimensions()

    // prop 变化时 message 跟着更新
    useEffect(() => {
        setMessage(propsMessage)
    }, [propsMessage])

    useEffect(() => {
        setStatus(propsStatus)
    }, [propsStatus])

    useEffect(() => {
        DataStore.query(User, message.userID).then(setUser)
    }, [])

    useEffect(() => {
        if (propsStatus === 'SENT' && message?.audioKey) {
            downloadSound()
        }
    }, [message, status])

    const downloadSound = async () => {
        const uri = await Storage.get(message.audioKey);
        setSoundUri(uri)
    }


    return (
        <View
            style={[styles.containter,{}]}
        >
            {
                !!message.imageKey && (
                    status === 'INPUT' ? <Text style={styles.textStyle}>`${user?.name}：[图片]`</Text>
                        :
                        <View style={{flexDirection:'row'}}>
                            <Text style={styles.textStyle}>{`${user?.name}：`}</Text>
                            <S3Image
                                imgKey={message.imageKey}
                                style={{ width: 35, aspectRatio: 1 / 1 }}
                                resizeMode="contain"
                            />
                        </View>
            )}
            {
                !!message.audioKey && (
                    status === 'INPUT' ? <Text style={styles.textStyle}>{`${user?.name}：[语音]`}</Text>
                        :
                        <View style={{flexDirection:'row'}}>
                            <Text style={styles.textStyle}>{`${user?.name}：`}</Text>
                            <AudioPlayer soundUri={soundUri} fromMessageReply={true}/>
                        </View>
                )}
            {
                !!message.content &&
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.textStyle}>{`${user?.name}：${message.content}`}</Text>
                </View>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    containter: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor:"#f2f2f2", 
        borderRadius: 10,
        padding: 5,
    },
    textStyle: {
        fontSize: 13,
        color: 'grey'
    }
})