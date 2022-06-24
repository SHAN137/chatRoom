/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { ColorSchemeName, Pressable } from 'react-native';

import NotFoundScreen from '../screens/NotFoundScreen';

import { RootStackParamList, RootTabParamList, RootTabScreenProps } from '../types';
import LinkingConfiguration from './LinkingConfiguration';

import ChatRoomScreen from '../screens/ChatRoomScreen';
import HomeScreen from '../screens/HomeScreen'

export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ headerTitle: props => <HomeHeader {...props}/> }}
      />
      <Stack.Screen 
        name="ChatRoom" 
        component={ChatRoomScreen} 
        options={({route}) => {
          console.log('ChatRoom route-->', route)
          return({ 
          headerTitle: (props) => <ChatRoomHeader {...route.params}/>,
          headerBackTitleVisible: false,
        })}
      }
      />
      <Stack.Screen name="NotFound" component={NotFoundScreen} />
    </Stack.Navigator>
  );
}

import { View, Image, Text, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';



const HomeHeader = (props) => {
  const { width } = useWindowDimensions()

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
      <Feather style={{marginHorizontal: 10}} name='edit-2' size={24} color="black" />
    </View>
  )
}

const ChatRoomHeader = (props) => {
  const { width } = useWindowDimensions()
  console.log('ChatRoomHeader-porps',props)
  return (
    <View style={{ 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      backgroundColor:'lightblue', 
      width: width - 48,
      marginLeft: -25,
      padding: 8,
      
    }}>
      <Image 
        source={{uri: 'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/avatars/jeff.jpeg'}}
        style={{width: 30, height: 30, borderRadius: 15}}
      />
      <Text style={{flex: 1, marginLeft: 10, fontWeight: 'bold'}}>{props.name}</Text>
      <Feather style={{marginHorizontal: 10}} name='camera' size={24} color="black" />
      <Feather style={{marginHorizontal: 10}} name='edit-2' size={24} color="black" />
    </View>
  )
}