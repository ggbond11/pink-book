import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity, Dimensions, Platform, Modal, Pressable, ScrollView, RefreshControl } from 'react-native';
import MasonryList from '@react-native-seoul/masonry-list';
import { COLORS, FONTS } from '../styles/theme';
import { useNavigation } from '@react-navigation/native';
import { getAllPosts, addPost } from '../utils/postStorage';
import { saveMultipleImages, getActualImageUri } from '../utils/imageStorage';
import LoadingSpinner from '../components/LoadingSpinner';

const { width } = Dimensions.get('window');
const isTablet = width >= 600;
const CARD_GAP = 8;
const CARD_WIDTH = (width - 12 * 2 - CARD_GAP) / 2; // 12为content左右padding

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.primaryLight,
    // overflow: 'hidden', // 防止web端内容溢出
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  logoText: {
    color: COLORS.white,
    fontSize: isTablet ? 28 : 24,
    fontWeight: 'bold',
    marginRight: 8,
    fontFamily: FONTS.base,
  },
  searchBoxWrapper: {
    flex: 1,
    marginHorizontal: 6,
    backgroundColor: COLORS.white,
    borderRadius: 28,
    justifyContent: 'center',
    height: 48,
  },
  searchBox: {
    paddingHorizontal: 18,
    fontSize: isTablet ? 18 : 16,
    color: COLORS.primary,
    height: 48,
    borderRadius: 28,
    fontFamily: FONTS.base,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    marginLeft: 8,
    // overflow: 'hidden',
  },
  content: {
    paddingHorizontal: 12,
    paddingTop: 16,
    // paddingBottom: 80,
  },
  columnWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: CARD_GAP,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: isTablet ? 22 : 18,
    color: '#222',
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: FONTS.base,
  },
  cardSummary: {
    fontSize: isTablet ? 16 : 14,
    color: COLORS.gray,
    fontFamily: FONTS.base,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    height: 56,
    alignItems: 'center',
    justifyContent: 'space-around',
    // 兼容 web 端底部固定
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabText: {
    color: COLORS.white,
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    fontFamily: FONTS.base,
  },
});

const menuStyles = StyleSheet.create({
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuContainer: {
    marginTop: Platform.OS === 'ios' ? 60 : 40,
    marginRight: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  menuItemText: {
    fontSize: 16,
    color: COLORS.primary,
    textAlign: 'center',
    fontFamily: FONTS.base,
  },
});

// 生成更多mock数据，内容长短不一
const randomSummary = [
  '用户分享的内容摘要...\n生活点滴，记录美好。',
  '今天遇到的趣事，和大家分享一下。',
  '美食推荐：这家餐厅真的很棒！',
  '旅行日记：风景如画，心情愉快。',
  '健身打卡，坚持就是胜利！',
  '新书推荐，值得一读。',
  '日常随拍，感受生活美好。',
  '宠物日常，萌宠来袭。',
  '学习心得，进步每一天。',
  '手工DIY，乐趣无穷。',
  '今日穿搭，分享灵感。',
  '摄影作品，光影之间。',
  '家居布置，温馨舒适。',
  '护肤心得，变美小技巧。',
  '运动日常，健康生活。',
  '美妆分享，变美每一天。',
  '工作感悟，成长记录。',
  '周末时光，休闲放松。',
  '追剧安利，精彩不断。',
  '生活感悟，点滴成长。',
  // 长内容，撑高卡片
  '今天和朋友们一起去了郊外野餐，阳光明媚，微风不燥。我们带了很多美食，有三明治、水果、蛋糕，还有自制的柠檬水。大家在草地上聊天、拍照、玩游戏，度过了非常愉快的一天。希望以后还能有更多这样的美好时光！',
  '最近在家尝试了很多新菜式，比如红烧肉、糖醋排骨、番茄牛腩、咖喱鸡块，每一道都很有成就感。烹饪的过程虽然有点累，但看到家人吃得开心，觉得一切都值得了。',
  '刚刚读完一本很棒的书，内容非常丰富，讲述了主人公在逆境中不断成长、追逐梦想的故事。书中的很多观点都让我深受启发，推荐大家也去看看！',
  '旅行日记：这次去了云南大理，洱海的风景真的很美。每天骑行在湖边，看着蓝天白云和远处的雪山，心情特别放松。还品尝了当地的美食，认识了很多有趣的朋友。',
  '健身记录：坚持打卡30天啦！每天早起跑步、做力量训练，虽然有时候很累，但身体变得更有活力了。希望能一直坚持下去，变得更健康更自信。',
  '摄影作品：最近迷上了拍摄城市夜景。灯光、车流、建筑交织在一起，形成了独特的美感。每次按下快门都觉得很有成就感，欢迎大家来交流摄影心得！',
];

type Post = {
  id: number;
  title: string;
  summary: string;
};


export default function HomeScreen() {

  const navigation = useNavigation<any>();
  const [menuVisible, setMenuVisible] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView | undefined>(undefined);
  const [refreshing, setRefreshing] = useState(false);

  // 处理刷新的函数
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setPosts(prev => shuffle(prev));
      setRefreshing(false);
    }, 1000);
  }, []);

  function shuffle(arr: any[]) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const handleHomeTab = () => {
    if (Platform.OS === 'web') {
      const scrollEl = document.querySelector('.masonry-scroll-top');
      if (scrollEl) (scrollEl as HTMLElement).scrollTo(0, 0);
    } else if (scrollRef.current) {
      // 直接使用 ScrollView 的 scrollTo 方法
      scrollRef.current.scrollTo({ y: 0, animated: true });
    }
    setLoading(true);
    setTimeout(() => {
      setPosts(prev => shuffle(prev));
      setLoading(false);
    }, 1000);
  };

  // 首次加载时从本地读取帖子
  useEffect(() => {
    const loadPosts = async () => {
      const posts = await getAllPosts();

      // 处理每个帖子的图片URI
      const processedPosts = await Promise.all(posts.map(async (post) => {
        if (post.images && post.images.length > 0) {
          const processedImages = await Promise.all(
            post.images.map(uri => getActualImageUri(uri))
          );
          return { ...post, images: processedImages };
        }
        return post;
      }));

      setPosts(processedPosts);
    };

    loadPosts();
  }, []);

  // 跳转发布页时传递回调
  const handleGoPostEditor = () => {
    navigation.navigate('PostEditor', {
      onPublish: async (post: { title: string; text: string; images: string[] }) => {
        try {
          setLoading(true); // 显示加载状态

          let permanentImages = post.images || [];
          console.log('原始图片:', permanentImages);

          // 如果有图片，先保存到永久存储
          if (post.images && post.images.length > 0) {
            permanentImages = await saveMultipleImages(post.images);
            console.log('永久存储后的图片:', permanentImages);
          }

          const newPost = {
            id: Date.now(),
            title: post.title || '新发布',
            summary: post.text || '',
            images: permanentImages  // 使用永久存储的图片路径
          };

          await addPost(newPost);

          // 对于Web平台，需要特殊处理图片URI
          if (Platform.OS === 'web' && newPost.images && newPost.images.length > 0) {
            const processedImages = await Promise.all(
              newPost.images.map(uri => getActualImageUri(uri))
            );
            newPost.images = processedImages;
          }

          setPosts(prev => [newPost, ...prev]);
        } catch (error) {
          console.error('发布帖子失败:', error);
          alert('发布失败，请重试');
        } finally {
          setLoading(false); // 隐藏加载状态
        }
      }
    });
  };

  const handleLogout = () => {
    setMenuVisible(false);
    setTimeout(() => {
      if (navigation.reset) {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      } else {
        navigation.navigate('Login');
      }
    }, 200);
  };

  return (
    <View style={styles.root}>
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <Text style={styles.logoText}>小粉书</Text>
        <View style={styles.searchBoxWrapper}>
          <TextInput
            style={styles.searchBox}
            placeholder="搜索你的生活..."
            placeholderTextColor="#ff69b4"
          />
        </View>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Image source={require('../../assets/icon.png')} style={styles.avatar} />
        </TouchableOpacity>
      </View>
      {/* 下拉菜单 */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={menuStyles.menuOverlay} onPress={() => setMenuVisible(false)}>
          <View style={menuStyles.menuContainer}>
            <TouchableOpacity style={menuStyles.menuItem} onPress={handleLogout}>
              <Text style={menuStyles.menuItemText}>退出登录</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
      {/* 内容区域：真正瀑布流 */}
      <View
        className="masonry-scroll-top"
        style={
          Platform.OS === 'web'
            ? {
              height: 'calc(100vh - 56px)', // 56px为底部tabBar高度
              overflowY: 'auto',
            }
            : { flex: 1, minHeight: 0 }
        }
      >
        <MasonryList
          innerRef={scrollRef}
          data={posts}
          keyExtractor={(item: Post) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={true}
          refreshing={refreshing}
          onRefresh={onRefresh}
          refreshControl={true}
          refreshControlProps={{
            colors: [COLORS.primary], // Android 上的颜色
            tintColor: COLORS.primary, // iOS 上的颜色
          }}
          renderItem={({ item }: any) => {
            const handlePress = () => {
              navigation.navigate('PostDetail', { post: item });
            };

            const hasValidImages = item.images &&
              Array.isArray(item.images) &&
              item.images.length > 0 &&
              item.images[0];

            if (hasValidImages) {
              return (
                <TouchableOpacity onPress={handlePress}>
                  <View style={[styles.card, { width: CARD_WIDTH, alignSelf: 'flex-start' }]}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardSummary}>{item.summary}</Text>
                    <View style={{ marginTop: 8 }}>
                      {/* 只展示第一张图片 */}
                      <Image
                        source={{ uri: item.images[0] }}
                        style={{ width: '100%', height: 120, borderRadius: 8 }}
                        resizeMode="cover"
                        onError={(e) => console.error('图片加载失败:', item.images[0], e.nativeEvent.error)}
                      />
                      {/* 如果有多张图片，显示+N的提示 */}
                      {item.images.length > 1 && (
                        <View style={{
                          position: 'absolute',
                          right: 8,
                          bottom: 8,
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 12,
                        }}>
                          <Text style={{ color: 'white', fontSize: 12 }}>+{item.images.length - 1}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity onPress={handlePress}>
                <View style={[styles.card, { width: CARD_WIDTH, alignSelf: 'flex-start' }]}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSummary}>{item.summary}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
        {loading && <LoadingSpinner />}
      </View>
      {/* 底部导航栏 */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={handleHomeTab}>
          <Text style={styles.tabText}>首页</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={handleGoPostEditor}>
          <Text style={styles.tabText}>发布</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}><Text style={styles.tabText}>消息</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}><Text style={styles.tabText}>个人</Text></TouchableOpacity>
      </View>
    </View >
  );
}