import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';

// 配置 Amplify
import { Amplify, Auth } from 'aws-amplify';
import awsconfig from './chatRoomBackend/src/aws-exports';
import { withAuthenticator } from 'aws-amplify-react-native';

import { DataStore, Hub, syncExpression } from 'aws-amplify';
import { useEffect, useState } from 'react';
import { Message as MessageModel, User as UserModel } from './chatRoomBackend/src/models';

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

  const [authUser, setAuthUser] = useState<UserModel>()

  useEffect(() => {
    // Create listener
    const listener = Hub.listen('datastore', async hubData => {
      const { event, data } = hubData.payload;
      // console.log('*************datastore event***********************')
      // console.log('event', event)
      // console.log('data', data)

      if (event === 'networkStatus') {
        console.log(`User has a network connection: ${data.active}`)
      }
      if (
        event === 'outboxMutationProcessed'
        && data.model === MessageModel
        && !(["DELIVERED", "READ"].includes(data.element.status))
      ) {
        console.log(`when a local change has finished synchronization with the Cloud and is updated locally`, data)
        // set the message status to delivered
        DataStore.save(
          MessageModel.copyOf(data.element, updated => {
            updated.status = 'DELIVERED'
          })
        )
      }
    })

    return (() => {
      // Remove listener
      listener();
    })
  }, [])

  useEffect(() => {
    fetchAuthUser()
  }, [])

  // authUser "_version" 没变， user 在远程库不会更新
  useEffect(() => {
    if (!authUser) {
      return;
    }

     // 监听 user 有无被更改
    const subscription = DataStore.observe(UserModel, authUser.id).subscribe(msg => {
      if (msg.model === UserModel && msg.opType === 'UPDATE') {
          setAuthUser(msg.element)
      }
    });

    // component will unmount
    return () => subscription.unsubscribe()
  }, [authUser?.id])

  useEffect(() => {
    // 每次都创建一个定时器
    const intervalID = setInterval(() => {
      // console.log('updateLastOnline')
      updateLastOnline()
    }, 5000);
    // console.log('intervalID',intervalID)
    return () => clearInterval(intervalID)
  }, [authUser])

  const fetchAuthUser = async () => {
    const auth = await Auth.currentAuthenticatedUser()
    const user = await DataStore.query(UserModel, auth.attributes.sub)
    if(user) {
      setAuthUser(user)
    }
  } 

  const updateLastOnline = async() => {
    if(!authUser) {
      return;
    }
    const updatedUser = await DataStore.save(
      UserModel.copyOf(authUser, (updated) => {
        updated.lastOnlineAt = new Date().getTime();
      })
    )
    // console.log('updatedUser',updatedUser)
    // setAuthUser(updatedUser)
  }

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