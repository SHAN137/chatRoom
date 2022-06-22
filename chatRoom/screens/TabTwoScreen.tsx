import React from 'react';
import {View, StyleSheet} from 'react-native';

import Message from '../components/Messsge';
import chatData from '../assets/SignalAssets/dummy-data/Chats';

export default function ChatRoomScreen() {
    return (
        <View style={styles.page}>
            <Message message={ chatData.messages[0] }/>
        </View>
    )
}

const styles = StyleSheet.create({
    page: {
        backgroundColor: 'white',
        flex: 1,
    }
})