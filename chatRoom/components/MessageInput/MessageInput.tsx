import React, { useState, useEffect } from 'react';
import { View, Image, Text, TextInput, StyleSheet, Pressable, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
// import styles from './styles';
// import styles from './styles';
import Colors from '../../constants/Colors'
import { SimpleLineIcons, Feather, MaterialCommunityIcons, AntDesign, Ionicons } from '@expo/vector-icons';

import { DataStore, Auth, Storage } from 'aws-amplify';
import { Message as MessageModel } from '../../chatRoomBackend/src/models';
import { ChatRoom } from '../../chatRoomBackend/src/models';

import EmojiSelector from 'react-native-emoji-selector';
import * as ImagePicker from 'expo-image-picker';

import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

import { Audio } from 'expo-av';
import { Recording } from 'expo-av/build/Audio';
import AudioPlayer from '../AudioPlayer';

export default function MessageInput({ chatRoom }) {
  // 
  // inputMessage
  const [message, setMessage] = useState('');
  const [isEmojiSelectorOpen, setIsEmojiSelectorOpen] = useState(false);
  const [image, setImage] = useState<string|null>(null);  // 图片在本地的 uri
  const [imgUploadprogress, setImgUploadprogress] = useState(0);  // 图片上传数据库进度
  const [recording, setRecording] = useState<Recording|null>(null)
  const [soundUri, setSoundUri] = useState<Audio.Sound | null>(null); // 音频在本地的 uri
  

  // 重置所有 state
  const resetFields = () => {
    setMessage('')
    setImage(null)
    setIsEmojiSelectorOpen(false)
    setImgUploadprogress(0)
    setRecording(null)
    setSoundUri(null)
  }

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        // 询问用户读取图库和使用相机权限
        const cameraRollStatus =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraRollStatus.status !== "granted" ||
        cameraStatus.status !== "granted") {
          alert("Sorry, we need these permissions to make this work!");
        }
        await Audio.requestPermissionsAsync();
      }
    })();
  }, []);

  // 文本、图片、音频
  const onPressSendIcon = () => {
    if (image) {
      sendImage()
    } else if (soundUri) {
      sendAudio()
    }else if (message) {
      sendMessage()
    } else {
      onPlusClick()
    }
  }

  const sendMessage = async ({ imageKey=null, audioKey=null }) => {
    const authData = await Auth.currentAuthenticatedUser()
    const newMessage = await DataStore.save(new MessageModel({
      content: message,
      userID: authData.attributes.sub,
      imageKey,
      audioKey,
      chatroomID: chatRoom.id,
    }))

    updateLastMessage(newMessage)

    resetFields()
  }

  const updateLastMessage = async (newMessage) => {
    DataStore.save(ChatRoom.copyOf(chatRoom, updated => {
      updated.lastMessage = newMessage;
    }))
  }

  const onPlusClick = () => {}
  // 图片、音频
  const getBlob = async (uri) => {
    if (!uri) {
      return null;
    }

    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
  }
  // 表情
  const onPressSmileIcon = () => {
    setIsEmojiSelectorOpen( currentValue => !currentValue )
  }

  const setEmojiMessage = (emoji) => {
    setMessage( currentValue => currentValue + emoji)
  }

  // ImagePicker
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      // allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if(!result.cancelled) {
      setImage(result.uri)
    }
    // this.handleImagePicked(result);
  };

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 3],
    });

    if(!result.cancelled) {
      setImage(result.uri)
    }
  };

  const closeImage = () => {
    setImage(null)
  }

  const sendImage = async () => {
    if (!image) {
      return;
    }

    const blob = await getBlob(image);
    // 唯一的随机id
    const { key }  = await Storage.put(`${uuidv4()}.png`, blob, {
      progressCallback: (progress) => progressCallback(progress)
    })

    sendMessage({imageKey: key})
  }

  const progressCallback = (progress) => {
    console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
    setImgUploadprogress(progress.loaded/progress.total)
  }

  // Audio
  const startRecording = async () => {
    try {
      console.log('Requesting permissions..');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      }); 
      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
         Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  const stopRecording = async () => {
    if (!recording) {
      return;
    }
    console.log('Stopping recording..');
    setRecording(null);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,   // 让播放的声音来自于扬声器而不是耳机
    }); 
    const uri = recording.getURI(); 
    setSoundUri(uri);
  }
 
  const sendAudio = async () => {
    if (!soundUri) {
      return;
    }

    // 音频文件扩展名
    const uriParts = soundUri.split(".")
    const extension = uriParts[uriParts.length - 1]

    const blob = await getBlob(soundUri);
    // 唯一的随机id
    const { key }  = await Storage.put(`${uuidv4()}.${extension}`, blob, {
      // progressCallback: (progress) => progressCallback(progress)
    })

    sendMessage({audioKey: key})
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      // keyboardVerticalOffset={100} 
    >
      { image && (
        <View style={styles.sendImageContainer}>
          <Image 
            source={{uri: image}} 
            style={{width: 100, height: 100, borderRadius: 10}}
          />
          <View style={{flex: 1}}>
            <View style={{
              alignSelf: 'flex-end',
              height: 5,
              width: `${imgUploadprogress * 100}%`,
              borderRadius: 5,
              backgroundColor: 'lightblue',
            }}></View>
          </View>
          <Pressable onPress={closeImage}>
            <AntDesign 
              name="close" 
              size={24} 
              color="grey" 
              style={{ margin: 5 }} 
            />
          </Pressable>
        </View>
      )}
      {
        !!soundUri && (<AudioPlayer soundUri={soundUri}/>)
      }
      {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}
      <View style={[styles.container, { height: isEmojiSelectorOpen ? "50%" : 'auto'}]}>
        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Pressable onPress={onPressSmileIcon}>
              <SimpleLineIcons 
                style={styles.icon}
                name="emotsmile" 
                size={24}
                color="#595959" 
              />  
            </Pressable>
            <TextInput
              style={styles.textInput}
              value={message}
              // onChangeText={(newMessage)=>setMessage(newMessage)}
              onChangeText={setMessage}
              placeholder={'message...'}
            />
            <Pressable onPress={pickImage}>
              <Feather 
                style={styles.icon} 
                name='image' 
                size={24} 
                color="#595959" 
              />
            </Pressable>
            <Pressable onPress={takePhoto}>
              <Feather 
                style={styles.icon} 
                name='camera' 
                size={24} 
                color="#595959" 
              />
            </Pressable>
            <Pressable onPressIn={startRecording} onPressOut={stopRecording}>
              <MaterialCommunityIcons 
                style={styles.icon} 
                name={recording ? "microphone" : "microphone-outline"}
                size={24} 
                color={recording ? 'blue' : '#595959' }
              />
            </Pressable>
          </View>
          <Pressable style={styles.bottonContainer} onPress={onPressSendIcon}>
            {
              (message || image || soundUri) ? <Ionicons name='send' size={24} color="white" /> : <AntDesign name='plus' size={24} color="white" />
            }
          </Pressable>
        </View>
        {
          isEmojiSelectorOpen && (
          <EmojiSelector
            onEmojiSelected={emoji => setEmojiMessage(emoji)} 
            columns={8}
          />
        )}
      </View>
      {/* </TouchableWithoutFeedback> */}
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  sendImageContainer: {
    margin: 10,
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 10,
  },
  container: {
    padding: 10,
  },
  row: {
    flexDirection: 'row',
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
  },
})
