import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

// 创建永久存储图片的目录
const setupImageDirectory = async (): Promise<string> => {
  // 检查可用的目录常量
  let baseDir = './';
  
  const imageDir = `${baseDir}images/`;
  
  try {
    const dirInfo = await FileSystem.getInfoAsync(imageDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(imageDir, { intermediates: true });
    }
  } catch (error) {
    console.error('创建图片目录失败:', error);
  }
  
  return imageDir;
};

// 将临时图片保存到永久存储
export const saveImageToPermanentStorage = async (uri: string): Promise<string> => {
  try {
    // 对于 web 平台，直接返回 URI，因为 web 平台的资源 URI 通常是网络 URL
    if (Platform.OS === 'web') {
      return uri;
    }
    
    const imageDir = await setupImageDirectory();
    const filename = `image_${Date.now()}_${Math.floor(Math.random() * 10000)}.jpg`;
    const destinationUri = `${imageDir}${filename}`;
    
    await FileSystem.copyAsync({
      from: uri,
      to: destinationUri
    });
    
    return destinationUri;
  } catch (error) {
    console.error('保存图片失败:', error);
    return uri; // 失败时返回原始 URI
  }
};

// 保存多张图片
export const saveMultipleImages = async (uris: string[]): Promise<string[]> => {
  const savedUris = await Promise.all(
    uris.map(uri => saveImageToPermanentStorage(uri))
  );
  return savedUris;
};