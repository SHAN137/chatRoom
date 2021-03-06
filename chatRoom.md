### 安全加密的实时聊天APP
前端 chatRoom：expo + Android Studio模拟器 + react Native + react navigation（stack navigation）
后端 aws amplify

#### 将学习的内容
- expo
- 内置组件（图像、列表、输入）
- 自己复用的组件
- 功能组件 & Hooks
- Props & State  内外部数据传输
- 原生样式
- 导航

资源数据下载 https://assets.notjust.dev/signal
放在了 assets 文件下

##### 初次在 expo 平台上链接 Android Studio 模拟器
1. 安装 Android Studio
haxm自动安装失败，改手动安装
https://github.com/intel/haxm/releases/tag/v7.7.0
2. 在 Android Studio 打开模拟设备
3. 启动 expo init 过的 React Native 项目，即输入 npm start

##### 前端页面(video 1)
1. 聊天室主页面
- ChatRoomItem
- 聊天室列表
    - Text 
        - numberOfLines={规定的行数}
        - ellipsizeMode='tail/clip/head/middle' 设置文本缩略格式，配合numberOfLines使用
            tail：在末尾…省略（默认值）
            clip：在末尾切割，直接切割字符无省略符
            head：在前面…省略
            middle：在中间…省略
    - FlatList
2. 聊天对话页面
- Message
- 对话列表
- MessageInput
- 键盘问题
    - 样式 父元素 flex：1，子元素铺满父元素剩余空间
    - 样式 maxWidth: '75%' + marginLeft：'auto'，框随内容伸缩且靠右 
    - SafeAreaView 安全区域（防止手机底部不平整而遮挡文字）
    - 键盘遮挡问题
        - rn 官网上的 keyboardAvoidingView 组件
            - <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
            - 使用后，虚拟机上的只显示前面的对话，多出滚动条而已 （FlatList 如果是 inverted={true} 就没有问题）
        - 用 ScrollView
            - FlatList会惰性渲染子元素，只在它们将要出现在屏幕中时开始渲染（也有ScrollView 的 api）
```
import {
    ......
    ScrollView,  // 引入相关组件
    Keyboard,
} from 'react-native';


// 监听键盘弹出与收回
componentDidMount() {
        this.keyboardWillShowListener = Keyboard.addListener('keyboardWillShow',this.keyboardDidShow);
        this.keyboardWillHideListener = Keyboard.addListener('keyboardWillHide',this.keyboardDidHide);
    }

//注销监听
componentWillUnmount () {
        this.keyboardWillShowListener && this.keyboardWillShowListener.remove();
        this.keyboardWillHideListener && this.keyboardWillHideListener.remove();
    }

//键盘弹起后执行
keyboardDidShow = () =>  {
        this._scrollView.scrollTo({x:0, y:100, animated:true});
    }

//键盘收起后执行
keyboardDidHide = () => {
        this._scrollView.scrollTo({x:0, y:0, animated:true});
    }

//用ScrollView将TextInput等组件包一层：
<ScrollView ref={component => this._scrollView=component} scrollEnabled={false} keyboardShouldPersistTaps={true}>
    ...... // 其他组件代码
</ScrollView>    
```
3. react navigation
4. 主页头部
    - 对于 React 函数组件，我们更推荐使用useWindowDimensions这个 Hook API。和 Dimensions 不同，它会在屏幕尺寸变化时自动更新

##### (video 2)
1. Amlify Studio
- 注册、登录 https://aws.amazon.com/cn/console/
- 跳转 Amlify Studio https://us-west-1.admin.amplifyapp.com/admin/dcd7klisda86a/staging/components
- 设置身份验证
- 创建表，且字段中的关系
2. 从 Amlify Studio 下载设置好的后端到本地
- 下载 Amlify Studio 中的后端项目
    - npm i -g @aws-amplify/cli
    - sign in
    - amplify pull --appId dcd7klisda86a --envName staging
    - Cognito 用户池（先提了这个功能而已）
- 本地配置 Amlify
    - Install Amplify libraries 说明网址 - https://docs.amplify.aws/start/getting-started/setup/q/integration/react-native/
        - npm install aws-amplify aws-amplify-react-native @react-native-community/netinfo @react-native-async-storage/async-storage @react-native-picker/picker
        - app.tsx
- 配置用户验证模块
    - app.tsx 
        - withAuthenticator 用高阶函数包裹，默认的用户验证页面
        - 默认保存用户 token
3. 将已验证的用户信息从 cognito 到数据库 with trigger
- 在 aws.DynamoDB 增加用户信息（使用 lambda trigger）
    - amplify auth update 
        - Which triggers do you want to enable for Cognito
        - Post Confirmation
        - Create your own module
    - 默认在验证邮箱后触发的函数（执行 custom.js）
    - object?.attr  
        object 恒等于 null 或者 undefined 时，取值为 undefined，否则为 object.attr
- 安全性
    - 常规应用中会有前端之前请求后端增加用户信息的接口
        - 暴露了创建数据库用户的操作，其他人也可以直接通过操作数据库增加
    - 此应用是在 trigger 后
        - 无法直接在数据库创建用户，比如来自 api （不可）
        - 授予 lambda 访问权限，能够将数据写入 dynamodb 
            - 在 Identity and Access Management (IAM) 添加权限策略 LambdaPolicy.json
            - 创建策略并将策略附加在角色上
            - 在 custom.js 上写下插入的信息
                - 打印信息在 CloudWatch 可查
- 启动出现 bug，本地和云端的两个运行环境冲突
    - 报错：jest-haste-map: Haste module naming collision: chatRoomPostConfirmation.The following files share their name; please adjust your hasteImpl:
        mockPath1: 'chatRoomBackend\\amplify\\#current-cloud-backend\\function\\chatRoomPostConfirmation\\src\\package.json',
        mockPath2: 'chatRoomBackend\\amplify\\backend\\function\\chatRoomPostConfirmation\\src\\package.json'
        - 解决方案 1  https://qa.1r1g.com/sf/ask/4259659351/
            - exclude the #current-backend-info folder from being tested by jest-haste-map  
                - ts 根目录下创建 metro.config.js 文件
                - 用 rn 的或者 rn-cli.config.js 文件
        - 解决方案 2
            - npm install @expo/metro-config --save-dev
            - 设置黑名单（没找到 blacklist 文件）
4. Integrate Datastore 
- Fetch Usres
    - 查询用户列表
    - bug 网页版可正常显示数据，手机安卓版不能连接云端数据库，只自动获取手机本地数据库
        - 原因：手机没联网, 得连模拟手机自带的 AndroidWifi（limited connection）
           
- Fetch & CreateChatRooms
    - tip 
        - !!chatRoom.newMessage 有时为 0 会报错，可取两次反，转为 boolen
- Send & Receive messages(in real time)
    - 订阅，与数据库云同步
        - DataStore.observe
- 复习
    - map 遍历数组每一个元素并调用回调，并返回一个包含所有结果的数组。就是在原有数据的基础上执行函数,并将执行函数后return的数据返回,形成一个新的数组
    - forEach循环,他和map不同之处呢,是不需要声明一个新的数组来接收返回值,forEach直接作用于数组本身,在原数组上进行函数操作

##### (video 3)
- send emoji
    - import EmojiSelector from 'react-native-emoji-selector'
- send images
    - 询问/打开手机相机访问权限
    - 获取本地相册图片的uri，相机拍摄照片uri
    - 删除/中断传输图片
    - 发送图片
        - 本地 uri —> blob(actual image) -> storage(Amazon S3)
    - 下载图片显示 s3Image组件
    - 通知图片上传进度
- send audio
    - 询问/打开手机音频访问权限
    - 开始/暂停录音，获取本地音频uri
    - 开始/暂停播放音频
    - 发送音频
        - 本地 uri —> blob(actual image) -> storage(Amazon S3
    - 下载图片显示 s3Image组件
    - 通知图片上传进度
- Android Studio 单独启动安卓模拟器
    - 打开 cd D:\AndroidSDK\emulator
    - 查看 .\emulator.exe -list-avds
    - 运行 .\emulator.exe -avd Pixel_2_API_30
    .\emulator.exe -avd Galaxy_Nexus_API_30
- 时间库
    - moment.js
    - day.js

##### (video 4)
- 消息状态 --> 已发送（初始状态）、已接收（监听 dataStore 同步）、已阅读（对方接受到已接收到的信息） 
- 用户离线与在线
- 引用信息
- 群组（一个管理员）
- 删除信息
    - react-native-action-sheet

##### (video 5)
- 加密
    - 对称加密 same secret key
    - 不对称加密（公钥、私钥）
        - 一个密钥对
        - 公钥加密、私钥解密（私下保存在某人设备上）
- 秘钥产生过程
    - 用户 sign up
    - 程序产生一对秘钥
    - 私钥 save to device storage，公钥 save to dataBase
    - 如果用公钥对数据加密，那么只能用对应的私钥解密
- A send Message to B（Encryption）
    - A plain message text
    - get user B public key
    - encryp message with user B public key
    - get a encryped message, then save in database
    - 库里存的是已经加密的信息  
- B receive a message （decryption）
    - get a encryped message from database
    - read a private key
    - decrypt with B private key, then get a decrypted message
- 项目
    - npm install tweetnacl

- 断网时，调用本地数据