import React, { useState, useEffect } from 'react';
import MasonryList from '@react-native-seoul/masonry-list';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Platform,
  ScrollView
} from 'react-native';
import { COLORS, FONTS } from '../styles/theme';
import { useNavigation } from '@react-navigation/native';
import { getUserProfile, getUserPosts } from '../utils/profileStorage';
import { getActualImageUri } from '../utils/imageStorage';
import LoadingSpinner from '../components/LoadingSpinner';

const { width } = Dimensions.get('window');
const isTablet = width >= 600;
const CARD_GAP = 8;
const CARD_WIDTH = (width - 16 * 2 - CARD_GAP) / 2; // 16为content左右padding
const isWeb = Platform.OS === 'web';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryLight,
    ...(isWeb && { height: '100vh' }), // 确保在web上容器占满整个视口高度
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: isTablet ? 22 : 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  settingButton: {
    padding: 8,
  },
  settingButtonText: {
    color: COLORS.white,
    fontSize: 18,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  nickname: {
    fontSize: isTablet ? 22 : 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
    fontFamily: FONTS.base,
  },
  bio: {
    fontSize: isTablet ? 16 : 14,
    color: COLORS.white,
    opacity: 0.8,
    fontFamily: FONTS.base,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    flex: 1,
    ...(isWeb && {
      overflow: 'auto', // 确保web端有滚动条
      height: 'calc(100vh - 180px)', // 减去header高度的近似值
    }),
  },
  scrollContent: {
    flexGrow: 1,
    ...(isWeb && { minHeight: '100%' }),
  },
  sectionTitle: {
    fontSize: isTablet ? 20 : 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: COLORS.primary,
    fontFamily: FONTS.base,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: CARD_GAP,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: isTablet ? 18 : 16,
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
  noPostsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noPostsText: {
    fontSize: isTablet ? 18 : 16,
    color: COLORS.gray,
    fontFamily: FONTS.base,
  },
  webPostsContainer: {
    paddingBottom: 20, // 添加底部间距
  },
  webScrollView: {
    flex: 1,
    ...(isWeb && {
      overflowY: 'auto', // 强制显示垂直滚动条
      WebkitOverflowScrolling: 'touch', // 提高iOS上的滚动体验
    }),
  },
  webMasonryContainer: {
    display: 'flex',
    width: '100%',
  },
  webMasonryColumn: {
    flex: 1,
    marginRight: CARD_GAP / 2,
    marginLeft: CARD_GAP / 2,
  }
});

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const [profile, setProfile] = useState<any>({ nickname: '', bio: '' });
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
  }, []);

  // 添加导航监听器，当用户从编辑页面返回时重新加载数据
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadProfileData();
    });

    return unsubscribe;
  }, [navigation]);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      // 加载用户资料
      const userProfile = await getUserProfile();
      setProfile(userProfile);

      // 加载用户发布的帖子
      const userPosts = await getUserPosts();

      // 处理帖子图片
      const processedPosts = await Promise.all(userPosts.map(async (post) => {
        if (post.images && post.images.length > 0) {
          const processedImages = await Promise.all(
            post.images.map((uri: string) => getActualImageUri(uri))
          );
          return { ...post, images: processedImages };
        }
        return post;
      }));

      setPosts(processedPosts);
    } catch (error) {
      console.error('加载个人资料失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleEditProfile = () => {
    navigation.navigate('ProfileEdit', { profile });
  };

  const handlePostPress = (post: any) => {
    // 将用户资料信息添加到帖子对象中，然后传递给详情页
    const postWithUserInfo = {
      ...post,
      author: {
        nickname: profile.nickname,
        avatar: profile.avatar,
        bio: profile.bio
      }
    };
    navigation.navigate('PostDetail', { post: postWithUserInfo });
  };

  const renderPostItem = ({ item }: { item: any }) => {
    const hasValidImages = item.images &&
      Array.isArray(item.images) &&
      item.images.length > 0 &&
      item.images[0];

    return (
      <TouchableOpacity onPress={() => handlePostPress(item)}>
        <View style={[styles.card, { width: CARD_WIDTH }]}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSummary} numberOfLines={2}>{item.summary}</Text>

          {hasValidImages && (
            <View style={{ marginTop: 8 }}>
              <Image
                source={{ uri: item.images[0] }}
                style={{ width: '100%', height: 120, borderRadius: 8 }}
                resizeMode="cover"
              />
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
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // 为web端创建瀑布流布局
  const renderWebMasonry = () => {
    if (posts.length === 0) {
      return (
        <View style={styles.noPostsContainer}>
          <Text style={styles.noPostsText}>还没有发布任何内容</Text>
        </View>
      );
    }

    // 将帖子分成两列
    const leftColumnPosts = [];
    const rightColumnPosts = [];

    for (let i = 0; i < posts.length; i++) {
      if (i % 2 === 0) {
        leftColumnPosts.push(posts[i]);
      } else {
        rightColumnPosts.push(posts[i]);
      }
    }

    const renderWebPostItem = (item: any) => {
      const hasValidImages = item.images &&
        Array.isArray(item.images) &&
        item.images.length > 0 &&
        item.images[0];

      return (
        <TouchableOpacity key={item.id.toString()} onPress={() => handlePostPress(item)}>
          <View style={[styles.card, { width: '100%' }]}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSummary} numberOfLines={2}>{item.summary}</Text>

            {hasValidImages && (
              <View style={{ marginTop: 8 }}>
                <Image
                  source={{ uri: item.images[0] }}
                  style={{ width: '100%', height: 120, borderRadius: 8 }}
                  resizeMode="cover"
                />
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
            )}
          </View>
        </TouchableOpacity>
      );
    };

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: `${CARD_GAP}px`,
      }}>
        {/* 左列 */}
        <div style={{ flex: 1 }}>
          {leftColumnPosts.map(renderWebPostItem)}
        </div>

        {/* 右列 */}
        <div style={{ flex: 1 }}>
          {rightColumnPosts.map(renderWebPostItem)}
        </div>
      </div>
    );
  };

  // 使用原生DOM API直接设置滚动样式（仅在web端）
  useEffect(() => {
    if (isWeb) {
      // 添加一个内联样式到document.body
      const style = document.createElement('style');
      style.textContent = `
        body {
          overflow: auto !important;
          height: 100% !important;
}
        #root {
          height: 100% !important;
        }
        .rn-scroll-container {
          overflow-y: auto !important;
          -webkit-overflow-scrolling: touch !important;
        }
      `;
      document.head.appendChild(style);

      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>个人主页</Text>
          <TouchableOpacity onPress={handleEditProfile} style={styles.settingButton}>
            <Text style={styles.settingButtonText}>编辑</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileInfo}>
          <Image
            source={profile.avatar ? { uri: profile.avatar } : require('../../assets/icon.png')}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.nickname}>{profile.nickname}</Text>
            <Text style={styles.bio}>{profile.bio}</Text>
          </View>
        </View>
      </View>

      {isWeb ? (
        <View style={styles.webScrollView}>
          <div style={{
            overflowY: 'auto',
            height: 'calc(100vh - 180px)',
            paddingLeft: 16,
            paddingRight: 16,
            paddingTop: 16
          }}>
            <Text style={styles.sectionTitle}>我的发布</Text>
            {renderWebMasonry()}
          </div>
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>我的发布</Text>

          {posts.length > 0 ? (
            <MasonryList
              data={posts}
              renderItem={renderPostItem}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              showsVerticalScrollIndicator={true}
            />
          ) : (
            <View style={styles.noPostsContainer}>
              <Text style={styles.noPostsText}>还没有发布任何内容</Text>
            </View>
          )}
        </View>
      )}

      {loading && <LoadingSpinner />}
    </View>
  )
}
