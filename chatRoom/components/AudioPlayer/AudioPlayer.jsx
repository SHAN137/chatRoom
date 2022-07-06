import React, {useState, useEffect} from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Feather, } from '@expo/vector-icons';
const AudioPlayer = ({soundUri, fromMessageReply=false}) => {
    const [sound, setSound] = useState(null);
    const [isPlaySound, setIsPlaySound] =  useState(false)
    const [soundPlayprogress, setSoundPlayprogress] = useState(0);  // 录音播放进度
    const [audioRestTime, setAudioRestTime] = useState(0) 

    useEffect(() => {
        createSound()
        return () => {
            if(!sound) {
                return;
            }
            sound.unloadAsync()
        }
    }, [soundUri])

    const createSound = async() => {
        if (!soundUri) {
            return;
        }
        const { sound } = await Audio.Sound.createAsync(
            { uri: soundUri }, 
            {},
            onPlaybackStatusUpdate
        );
        setSound(sound);
    }

    const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        // 监听播放状态更新函数
        if(!status.isLoaded) {
          return;
        } 

        // 组件动态设置
        if(!status.isPlaying) {
            setSoundPlayprogress(0)
            // setAudioRestTime(status.durationMillis)
        }else {
            setSoundPlayprogress(status.positionMillis / (status.durationMillis || 1)); 
        } 
        setAudioRestTime(status.durationMillis - status.positionMillis || 0)     
        setIsPlaySound(status.isPlaying)
        
    }

    const playSound = async () => {
        if(!sound) {
          return;
        }
    
        if(!isPlaySound) {
          await sound.playFromPositionAsync(0);
        } else {
          await sound.pauseAsync()
        } 
    }
    

    const getRestTime = () => {

        const minutes = Math.floor(audioRestTime / (60 * 1000));
        const seconds = Math.ceil(audioRestTime % (60 * 1000) / 1000);
    
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
    }

    return (
        <View style={styles.sendAudioContainer}>
            <Pressable onPress={playSound}>
                <Feather name={isPlaySound ? 'pause' : 'play'} size={24} color='gray' />
            </Pressable>
            {
                !fromMessageReply && (
                    <View style={styles.audioProgressBG}>
                        {/* 前景 foreground */}
                        <View style={[styles.audioProgressFG, { left: `${soundPlayprogress * 100}%` } ]}></View> 
                    </View> 
            )}
            <Text>{getRestTime()}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    sendAudioContainer: {
        marginHorizontal: 10,
        marginTop: 10,
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'lightgray',
        borderRadius: 10,
        alignSelf: 'stretch',
        backgroundColor: 'white',
    },
    audioProgressBG: {
        height: 5,
        flex: 1,
        backgroundColor: 'lightgrey',
        borderRadius: 5,
        margin: 10,
    },
    audioProgressFG: {
        width: 10,
        height: 10,
        borderRadius: 10,
        backgroundColor: 'lightblue',
        position: 'absolute',
        top: -3
    },
})

export default AudioPlayer;