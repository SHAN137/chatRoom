### 安全加密的实时聊天APP实战
前端 chatRoom：expo + Android Studio模拟器 + react Native + react navigation（stack navigation）

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

##### 项目
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
