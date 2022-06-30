import React from "react";
import { View, Image, Text, useWindowDimensions, Pressable } from 'react-native';
import { useNavigation } from "@react-navigation/native";

import { Feather } from '@expo/vector-icons';

const HomeHeader = (props) => {
    const { width } = useWindowDimensions()
    const navigation = useNavigation()
  
    // console.log('HomeHeader.props, ', props, 'navigation', navigation);
  
    return (
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        backgroundColor:'lightblue', 
        width: width - 16,
        padding: 8,
      }}>
        <Image 
          source={{uri: 'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/avatars/jeff.jpeg'}}
          style={{width: 30, height: 30, borderRadius: 15}}
        />
        <Text style={{flex: 1, textAlign: 'center', marginLeft: 30, fontWeight: 'bold'}}>HOME</Text>
        <Feather style={{marginHorizontal: 10}} name='camera' size={24} color="black" />
        <Pressable onPress={()=> navigation.navigate('Users')}>
          <Feather style={{marginHorizontal: 10}} name='edit-2' size={24} color="black" />
        </Pressable>
      </View>
    )
}

export default HomeHeader;