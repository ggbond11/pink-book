# 小粉书 (Pink Book)

一个基于React Native和Expo开发的社交分享应用，类似于小红书的简化版。用户可以浏览、搜索、发布图文内容，并管理个人资料。

## 功能特点

### 用户系统
- 用户注册与登录
- 个人资料管理（头像、昵称、个性签名）
- 用户认证与会话管理

### 内容浏览
- 瀑布流布局展示内容
- 下拉刷新更新内容
- 内容详情查看

### 搜索功能
- 实时搜索内容
- 搜索结果高亮显示
- 搜索状态视觉反馈

### 内容发布
- 发布图文内容
- 多图片上传与预览
- 标题和正文编辑

### 用户界面
- 响应式设计，支持手机和平板布局
- 适配iOS、Android和Web平台
- 优雅的动画和过渡效果

## 技术栈

- **React Native**: 跨平台移动应用开发框架
- **Expo**: 简化React Native开发的工具和服务
- **React Navigation**: 应用内导航和路由
- **AsyncStorage**: 本地数据持久化
- **Expo Image Picker**: 图片选择和处理
- **Expo File System**: 文件管理
- **React Native Masonry List**: 瀑布流布局组件

## 项目结构

src/ 
├── components/ # 可复用组件 │ 
    └── LoadingSpinner.tsx 
├── pages/ # 页面组件 │ 
    ├── HomeScreen.tsx # 首页 │ 
    ├── LoginScreen.tsx # 登录页 │ 
    ├── RegisterScreen.tsx # 注册页 │ 
    ├── PostEditorScreen.tsx # 内容发布页 │ 
    ├── PostDetailScreen.tsx # 内容详情页 │ 
    ├── ProfileScreen.tsx # 个人主页 │ 
    └── ProfileEditScreen.tsx # 个人资料编辑页 
├── styles/ # 全局样式 │ 
    └── theme.ts # 主题配置 
├── utils/ # 工具函数 │ 
    ├── imageStorage.ts # 图片存储处理 │ 
    ├── postStorage.ts # 帖子数据处理 │ 
    └── profileStorage.ts # 用户资料处理 
└── App.tsx # 应用入口


## 安装与运行

### 前置要求
- Node.js (v14+)
- npm 或 yarn
- Expo CLI (`npm install -g expo-cli`)

### 安装依赖
```bash
# 使用npm
npm install

# 或使用yarn
yarn install

# 启动开发服务器
npm start
# 或
yarn start

# 在iOS模拟器上运行
npm run ios
# 或
yarn ios

# 在Android模拟器上运行
npm run android
# 或
yarn android

# 在Web浏览器中运行
npm run web
# 或
yarn web
