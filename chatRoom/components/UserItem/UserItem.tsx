import React from 'react';
import { View, Image, Text, Pressable } from 'react-native';


import styles from './styles';

import { Feather } from '@expo/vector-icons';


export default function UserItem({ user, onPress=null, isSeleted=null, onLongPress=null, isAdmin=null }) {

  return (
    <Pressable onPress={onPress} style={styles.container} onLongPress={onLongPress}>
      <Image source={{ uri: user?.imageUri }} style={styles.image}></Image>
      <View style={styles.rightContainer}>
        <View style={styles.row}>
          <Text style={styles.name}>{user?.name}</Text>
        </View>
      </View>
      {
        isSeleted !== null && <Feather name={isSeleted?"check-circle":"circle"} size={24} color="black" style={{}}/>
      }
      {
        isAdmin && <Feather name={"user"} size={24} color="black" style={{}}/>
      }
    </Pressable>
  )
}

