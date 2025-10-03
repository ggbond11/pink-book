import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Platform, 
  Dimensions,
  FlatList
} from 'react-native';
import { COLORS, FONTS } from '../styles/theme';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 600;
const IMAGE_HEIGHT = height * 0.5; // 图片高度为屏幕高度的一半

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 16,
    backgroundColor: COLORS.primary,
    zIndex: 10,
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
    marginRight: 40, // 为了平衡返回按钮的宽度
  },
  content: {
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
  },
  username: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    marginLeft: 12,
    color: COLORS.primary,
    fontFamily: FONTS.base,
  },
  imageContainer: {
    width: width,
    height: IMAGE_HEIGHT,
  },
  postImage: {
    width: width,
    height: IMAGE_HEIGHT,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
  activeDot: {
    backgroundColor: COLORS.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  title: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#222',
    fontFamily: FONTS.base,
  },
  summary: {
    fontSize: isTablet ? 18 : 16,
    lineHeight: isTablet ? 28 : 24,
    color: COLORS.gray,
    fontFamily: FONTS.base,
  },
  noImage: {
    marginTop: 16,
  },
});

export default function PostDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { post } = route.params as { post: any };
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // 获取作者信息，如果存在的话
  const authorNickname = post.author?.nickname || "用户昵称";
  const authorAvatar = post.author?.avatar;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const roundIndex = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    
    setActiveIndex(roundIndex);
  };

  const renderImageCarousel = () => {
    if (!post.images || post.images.length === 0) {
      return null;
    }

    return (
      <View>
        <FlatList
          ref={flatListRef}
          data={post.images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          renderItem={({ item }) => (
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: item }} 
                style={styles.postImage} 
                resizeMode="cover"
              />
            </View>
          )}
          keyExtractor={(_, index) => index.toString()}
        />
        {post.images.length > 1 && (
          <View style={styles.paginationContainer}>
            {post.images.map((_: any, index: number) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  activeIndex === index ? styles.activeDot : undefined,
                ]}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>帖子详情</Text>
      </View>

      <ScrollView>
        <View style={styles.userInfo}>
          <Image 
            source={authorAvatar ? { uri: authorAvatar } : require('../../assets/icon.png')} 
            style={styles.avatar} 
          />
          <Text style={styles.username}>{authorNickname}</Text>
        </View>

        {renderImageCarousel()}

        <View style={[styles.content, !post.images || post.images.length === 0 ? styles.noImage : null]}>
          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.summary}>{post.summary}</Text>
        </View>
      </ScrollView>
    </View>
  );
}