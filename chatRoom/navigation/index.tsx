/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { ColorSchemeName } from 'react-native';

import NotFoundScreen from '../screens/NotFoundScreen';

import { RootStackParamList, RootTabParamList, RootTabScreenProps } from '../types';
import LinkingConfiguration from './LinkingConfiguration';

import ChatRoomScreen from '../screens/ChatRoomScreen';
import HomeScreen from '../screens/HomeScreen';
import UsersScreen from '../screens/UsersScreen';
import GroupInfoScreen from '../screens/GroupInfoScreen';
import SettingScreen from '../screens/SettingScreen';

import ChatRoomHeader from './ChatRoomHeader';
import HomeHeader from './HomeHeader';


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
        options={({route, navigation}) => {
            return({ 
              headerTitle: (props) => <ChatRoomHeader id={route.params?.id} />,
              headerBackTitleVisible: false,
            })
          }
        }
      />
      <Stack.Screen 
        name="GroupInfo" 
        component={GroupInfoScreen} 
      />
      <Stack.Screen 
        name="Users" 
        component={UsersScreen} 
        options={{ 
          title: 'Users',
          // headerBackTitleVisible: false,  
        }}
      />
      <Stack.Screen 
        name="Setting" 
        component={SettingScreen} 
        options={{ 
          title: 'Setting',
          // headerBackTitleVisible: false,  
        }}
      />
      <Stack.Screen name="NotFound" component={NotFoundScreen} />
    </Stack.Navigator>
  );
}