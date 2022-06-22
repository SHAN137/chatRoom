import React from 'react';
import {Text, View, StyleSheet} from 'react-native';

const myId = 'u1'

export default function Message({ message }) {

    const isMe = message.user.id === myId;

    // console.log('message', message)
    return(
        <View style={[styles.containter, isMe ? styles.leftContainer : styles.rightContainer]}>
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
        backgroundColor: '#3872E9',
        marginLeft: 10,
        marginRight: 'auto'
    },
    rightContainer: {
        backgroundColor: 'lightgrey',
        marginLeft: 'auto',
        marginRight: 10
    },
})