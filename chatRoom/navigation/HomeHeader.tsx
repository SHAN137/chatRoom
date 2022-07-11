import React, { useEffect, useState } from "react";
import { View, Image, Text, useWindowDimensions, Pressable } from 'react-native';
import { useNavigation } from "@react-navigation/native";

import { Feather } from '@expo/vector-icons';
import { User } from "../chatRoomBackend/src/models";

import { Auth, DataStore } from 'aws-amplify';

const HomeHeader = (props) => {
    const { width } = useWindowDimensions()
    const navigation = useNavigation()

    const [authUser, setAuthUser] = useState<User|null>(null)
  
    useEffect(()=>{
      fetchAuthUser()
    }, [])

    const fetchAuthUser = async() => {
      const authUser = await Auth.currentAuthenticatedUser()
      const dbUser = await DataStore.query(User, authUser.attributes.sub) || null
      setAuthUser(dbUser)
    }
  
    return (
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        width: width - 16,
        padding: 8,
      }}>
        <Image 
          source={{uri: authUser?.imageUri}}
          style={{width: 30, height: 30, borderRadius: 5}}
        />
        <Text style={{flex: 1, textAlign: 'center', marginLeft: 30, fontWeight: 'bold'}}>HOME</Text>
        <Pressable onPress={()=> navigation.navigate('Setting')}>
          <Feather style={{marginHorizontal: 10}} name='settings' size={24} color="black" />
        </Pressable>
        <Pressable onPress={()=> navigation.navigate('Users')}>
          <Feather style={{marginHorizontal: 10}} name='user' size={24} color="black" />
        </Pressable>
      </View>
    )
}

export default HomeHeader;