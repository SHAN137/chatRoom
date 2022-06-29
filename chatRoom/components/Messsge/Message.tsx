import React, { useState, useEffect } from 'react';
import {Text, View, StyleSheet} from 'react-native';

import { DataStore, Auth } from 'aws-amplify';
import { User } from '../../chatRoomBackend/src/models';

const myId = 'u1'

export default function Message({ message }) {
    const [user, setUser] = useState<User|undefined>()
    const [isMe, setIsMe] = useState<boolean>(false)

    useEffect(() => {
        DataStore.query(User, message.userID).then(setUser)
    }, [])

    useEffect(() => {
        const checkIsMe = async () => {
            if(!user) {
                return
            }
            const authData = await Auth.currentAuthenticatedUser()
            setIsMe(user.id === authData.attributes.sub)
        }
        checkIsMe()
    }, [user])

    // console.log('message', message)
    return(
        <View style={[styles.containter, isMe ? styles.rightContainer : styles.leftContainer]}>
            <Text style={{ color: isMe ? 'white' : 'black'}}>{ message.content }</Text>
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