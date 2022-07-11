import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, FlatList, Alert } from "react-native";
import { useRoute } from "@react-navigation/native";
import { DataStore, Auth } from "aws-amplify";
import { ChatRoomUser } from "../chatRoomBackend/src/models";
import UserItem from "../components/UserItem";



const GroupInfoScreen = () => {

    const route = useRoute();

    const [users, setUsers] = useState([])
    const [chatRoom, setChatRoom] = useState(null)
    const [chatRoomUsers, setChatRoomUsers] = useState([])

    useEffect(() => {
        if (!route?.params?.id) {
            return
        }
        fetchData()
    }, [])

    const fetchData = async() => {
        const chatRoomUsers = (await DataStore.query(ChatRoomUser))
            .filter((user) => user.chatRoom.id === route.params.id)
        
        setChatRoomUsers(chatRoomUsers)

        setChatRoom(chatRoomUsers[0].chatRoom)

        const users = chatRoomUsers.map((chatRoomUser) => chatRoomUser.user)
        setUsers(users)
    }

    const onLongPressItem = async(user) => {
        // 长按删除
        const authData = await Auth.currentAuthenticatedUser()
        if(chatRoom?.chatRoomAdminId !== authData.attributes.sub) {
            Alert.alert("你不是该群组的管理员")
            return;
        }

        if( user.id === chatRoom?.chatRoomAdminId) {
            Alert.alert("你是管理员，不能删除自己")
            return;
        }

        Alert.alert(
            '删除',
            `确认从该群组删除 ${user.name} 用户`,
            [
                {text: '确定', onPress: () => deleteUser(user)},
                {text: '取消', onPress: () => {}},
            ],
            {
                cancelable: true,
            }
        );
    }

    const deleteUser = async(user) => {
        const chatRoomUserToDelete = chatRoomUsers.filter((item) => item.user.id === user.id)

        if(chatRoomUserToDelete.length > 0) {
            await DataStore.delete(chatRoomUserToDelete[0])

            setUsers(users.filter(item => item.id !== user.id))
        }
        
    }

    return(
        <View style={styles.root}>
            <Text style={styles.text}>群组管理</Text>
            <Text style={styles.text}>{`${chatRoom?.name}（${users?.length}）`}</Text>
            <FlatList
                data={users}
                keyExtractor={(item, index) => index.toString()}  
                renderItem={({ item }) => 
                    <UserItem 
                        user={item} 
                        onLongPress={()=>onLongPressItem(item)}
                        isAdmin={item.id === chatRoom?.chatRoomAdminId}
                />} 
            />
        </View>
    )
}

const styles = StyleSheet.create({
    root: {
        padding: 5,
        backgroundColor: 'white',
        flex: 1
    },
    text: {
        marginVertical: 5,
        marginHorizontal: 10,
        fontSize: 18,
        fontWeight: '600',
    }
})

export default GroupInfoScreen