import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, useWindowDimensions } from 'react-native';

import { DataStore, Auth, Storage } from 'aws-amplify';
import { User } from '../../chatRoomBackend/src/models';

import { S3Image } from 'aws-amplify-react-native';
import AudioPlayer from '../AudioPlayer';

export default function Message({ message }) {
    const [user, setUser] = useState<User | undefined>()
    const [isMe, setIsMe] = useState<boolean>(false)
    const [soundUri, setSoundUri] = useState<string|null> (null)

    const { width } = useWindowDimensions()

    // useEffect(() => {
    //     const setUser = async () => {
    //         await DataStore.query(User, message.userID).then(setUser)
    //         if (!user) {
    //             return
    //         }
    //         const authData = await Auth.currentAuthenticatedUser()
    //         setIsMe(user.id === authData.attributes.sub)
    //     }
    //     setUser()
    // }, [])
    // 试试
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
        if(message.audioKey) {
            downloadSound()
        }
    }, [message])

    const downloadSound = async () => {
        const uri = await Storage.get(message.audioKey);
        setSoundUri(uri)
        // console.log('uri', uri)
    }
   
    return (
        <View style={[
            styles.containter, 
            isMe ? styles.rightContainer : styles.leftContainer,
            {width: message.audioKey ? '75%' : 'auto'}
        ]}>
            { !!message.imageKey && (
                <View style={{ marginBottom: !message.content ? 0 : 10 }}>
                    <S3Image 
                        imgKey={message.imageKey} 
                        style={{width: width * 0.5, aspectRatio: 4/3}}
                        resizeMode="contain"
                    />
                </View>
            )}
            {
               !! message.audioKey && (<AudioPlayer soundUri={soundUri}/>)
            }
            { !!message.content &&
                <View style={{alignItems: 'flex-end'}}>
                    <Text style={{ color: isMe ? 'white' : 'black' }}>{message.content}</Text>
                </View> 
            }
        </View>
    )
}

const styles = StyleSheet.create({
    containter: {
        maxWidth: '75%',
        padding: 10,
        margin: 10,
        borderRadius: 15,
    },
    leftContainer: {
        backgroundColor: 'lightgrey',
        marginLeft: 10,
        marginRight: 'auto'
    },
    rightContainer: {
        backgroundColor: '#3872E9',
        marginLeft: 'auto',
        marginRight: 10
    },
})