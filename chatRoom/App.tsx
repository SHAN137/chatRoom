import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';

// 配置 Amplify
import {Amplify, Auth } from 'aws-amplify';
import awsconfig from './chatRoomBackend/src/aws-exports';
import { withAuthenticator } from 'aws-amplify-react-native';

import { DataStore, Hub, syncExpression } from 'aws-amplify';
import { ChatRoom, User, ChatRoomUser } from './chatRoomBackend/src/models/index';

Amplify.configure({
  ...awsconfig,
  Analytics: { 
    disabled: true
  }
});

function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  // 用户验证的产生的信息
  // Auth.currentAuthenticatedUser().then(console.log)

  // const listener = Hub.listen('datastore', async hubData => {
  //   const  { event, data } = hubData.payload;
  //   console.log('event, data', event, data)
  //   if (event === 'networkStatus') {
  //     console.log(`User has a network connection: ${data.active}`)
  //   }
  // })

  // DataStore.configure({
  //   syncExpressions: [
  //     syncExpression(User, () => {
  //       console.log('syncExpressions-->', User)
  //       return User => User
  //     })
  //   ]
  // });
  // listener();

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider>
        <Navigation colorScheme={colorScheme} />
        <StatusBar />
      </SafeAreaProvider>
    );
  }
}

export default withAuthenticator(App);