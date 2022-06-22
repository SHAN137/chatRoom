import React, { useState } from 'react';
import { View, Image, Text, TextInput, StyleSheet, Pressable, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
// import styles from './styles';
// import styles from './styles';
import Colors from '../../constants/Colors'
import { SimpleLineIcons, Feather, MaterialCommunityIcons, AntDesign, Ionicons } from '@expo/vector-icons';

export default function MessageInput({ }) {
  // inputMessage
  const [message, setMessage] = useState('')

  const sendMessage = () => {
    setMessage('')
  }

  const onPlusClick = () => {

  }

  const onPress = () => {
    console.warn('press')
    if (message) {
      sendMessage()
    } else {
      onPlusClick()
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      // keyboardVerticalOffset={100} 
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.inputContainer}>
            <SimpleLineIcons style={styles.icon} name="emotsmile" size={24} color="#595959" />
            <TextInput
              style={styles.textInput}
              value={message}
              // onChangeText={(newMessage)=>setMessage(newMessage)}
              onChangeText={setMessage}
              placeholder={'message...'}
            />
            <Feather style={styles.icon} name='camera' size={24} color="#595959" />
            <MaterialCommunityIcons style={styles.icon} name='microphone-outline' size={24} color='#595959' />
          </View>
          <Pressable style={styles.bottonContainer} onPress={onPress}>
            {
              message ? <Ionicons name='send' size={24} color="white" /> : <AntDesign name='plus' size={24} color="white" />
            }
          </Pressable>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
  },
  inputContainer: {
    backgroundColor: '#f2f2f2',
    flex: 1,
    marginRight: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#dedede',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  icon: {
    marginHorizontal: 5,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'pink',
    marginHorizontal: 5,
  },
  bottonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.blue,
  },
  bottonText: {
    color: 'white',
    fontSize: 20,
  }
})