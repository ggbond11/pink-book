import AsyncStorage from '@react-native-async-storage/async-storage';
import { getActualImageUri } from './imageStorage';

export type UserProfile = {
  avatar?: string;
  nickname: string;
  bio: string;
};

const PROFILE_KEY = 'user_profile';

// 获取用户个人资料
export async function getUserProfile(): Promise<UserProfile> {
  try {
    const profileStr = await AsyncStorage.getItem(PROFILE_KEY);
    if (profileStr) {
      const profile = JSON.parse(profileStr);
      
      // 处理头像URI
      if (profile.avatar) {
        profile.avatar = await getActualImageUri(profile.avatar);
      }
      
      return profile;
    }
  } catch (error) {
    console.error('获取用户资料失败:', error);
  }
  
  // 默认用户资料
  return {
    nickname: '小粉书用户',
    bio: '这个人很懒，还没有写个性签名'
  };
}

// 保存用户个人资料
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    console.log('保存用户资料:', profile);
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('保存用户资料失败:', error);
  }
}

// 获取用户发布的帖子
export async function getUserPosts(userId?: string): Promise<any[]> {
  // 这里我们暂时从所有帖子中获取，实际应用中应该根据用户ID过滤
  const { getAllPosts } = require('./postStorage');
  const posts = await getAllPosts();
  return posts;
}
