import React from 'react';
import { View, Image, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import styles from './styles';

export default function UserItem({ user }) {

    const navigation = useNavigation()

    const onPress = () => {
      // 尽量在这少传数据
     // create chatRoom
    }
    
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Image source={{ uri: user.imageUrl }} style={styles.image}></Image>
      <View style={styles.rightContainer}>
        <View style={styles.row}>
          <Text style={styles.name}>{user.name}</Text>
        </View>
      </View>
    </Pressable>
  )
}

