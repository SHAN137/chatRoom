import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { AntDesign } from '@expo/vector-icons';

const GroupButton = ({onPress}) => {
    return(
        <Pressable style={styles.container} onPress={onPress}>
            <AntDesign name="addusergroup" size={24} color="black" />
            <Text style={styles.text}>新群组</Text>
        </Pressable>
    )
}

export default GroupButton

const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: 'lightblue',
      justifyContent: 'center',
      alignItems: "center",
      borderRadius: 10,
      height: 50,
      marginHorizontal: 10,
    },
    text: {
        fontWeight: 'bold',
        marginHorizontal: 10,
        fontSize: 20,
        color: 'grey',
    }
  });