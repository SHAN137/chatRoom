import React from "react";
import { View, Pressable, Text, StyleSheet, Alert } from 'react-native';
import { Auth, DataStore } from 'aws-amplify'; 
import { generateKeyPair, PRIVATE_KEY } from "../utils/crypto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User as UserModel} from "../chatRoomBackend/src/models";


const SettingScreen = () => {
    const logout = async() => {
        // 清空本地缓存
        await DataStore.clear()
        Auth.signOut()
    }

    const updateKeyPair = async() => {
        // generate private/public key
        const { publicKey, secretKey} = generateKeyPair();

        // save private key to Async storage
        await AsyncStorage.setItem(PRIVATE_KEY, secretKey.toString())

        // save public key to UserModel in Datastore
        const userData = await Auth.currentAuthenticatedUser()
        const dbUser = await DataStore.query(UserModel,userData.attributes.sub)

        if(!dbUser) {
            Alert.alert('User not found!')
            return;
        }
        await DataStore.save(
            UserModel.copyOf(dbUser, (updated)=> {
                updated.publicKey = publicKey.toString()
            })
        )
        Alert.alert('Update keyPair Success!')
     }

    return(
        <View style={{margin: 10}}>
            {/* logout */}
            <Pressable onPress={updateKeyPair} style={styles.buttonStyle}>
                <Text>更新秘钥</Text>
            </Pressable>
            {/* logout */}
            <Pressable onPress={logout} style={styles.buttonStyle}>
                <Text>退出登录</Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    buttonStyle: {
        backgroundColor: 'lightblue', 
        height: 50, 
        margin: 10, 
        justifyContent: 'center', 
        alignItems: 'center'
    }
})

export default SettingScreen