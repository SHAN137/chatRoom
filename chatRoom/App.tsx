import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';

// 配置 Amplify
import { Amplify, Auth } from 'aws-amplify';
import awsconfig from './chatRoomBackend/src/aws-exports';
import { withAuthenticator } from 'aws-amplify-react-native';

import { DataStore, Hub } from 'aws-amplify';
import { User } from './chatRoomBackend/src/models/index';

Amplify.configure(awsconfig)

function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  // 用户验证的产生的信息
  // Auth.currentAuthenticatedUser().then(console.log)
  // DataStore.start()

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