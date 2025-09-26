import * as FileSystemLegacy from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 图片URI映射的存储键
const IMAGE_MAPPING_KEY = 'image_mapping';
// Web平台图片存储键
const WEB_IMAGES_KEY = 'web_images';

// 创建永久存储图片的目录
const setupImageDirectory = async (): Promise<string> => {
  try {
    // 使用旧版 API 的 cacheDirectory
    const baseDir = FileSystemLegacy.cacheDirectory || '';

    if (!baseDir) {
      console.warn('无法获取缓存目录，使用相对路径');
      return 'images/';
    }

    const imageDir = `${baseDir}images/`;

    // 检查目录是否存在
    const dirInfo = await FileSystemLegacy.getInfoAsync(imageDir);
    if (!dirInfo.exists) {
      await FileSystemLegacy.makeDirectoryAsync(imageDir, { intermediates: true });
    }

    return imageDir;
  } catch (error) {
    console.error('创建图片目录失败:', error);
    return 'images/';
  }
};

// Web平台：将图片URL转换为Base64
const convertWebImageToBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!url || typeof url !== 'string') {
      console.error('无效的图片URL:', url);
      resolve('');
      return;
    }

    // 如果已经是Base64格式，直接返回
    if (url.startsWith('data:image')) {
      resolve(url);
      return;
    }

    if (Platform.OS !== 'web') {
      resolve(url);
      return;
    }

    // 创建一个Image对象来加载图片
    const img = new window.Image();
    img.crossOrigin = 'Anonymous'; // 允许跨域

    img.onload = () => {
      // 创建canvas
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      // 将图片绘制到canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('无法获取canvas上下文');
        resolve(url);
        return;
      }

      ctx.drawImage(img, 0, 0);

      // 转换为Base64
      try {
        const dataURL = canvas.toDataURL('image/jpeg');
        resolve(dataURL);
      } catch (e) {
        // 如果转换失败（可能是跨域问题），返回原始URL
        console.error('转换图片到Base64失败:', e);
        resolve(url);
      }
    };

    img.onerror = () => {
      console.error('加载图片失败:', url);
      resolve(url); // 失败时返回原始URL
    };

    img.src = url;
  });
};

// 将临时图片保存到永久存储
export const saveImageToPermanentStorage = async (uri: string): Promise<string> => {
  try {
    // 检查URI是否有效
    if (!uri || typeof uri !== 'string') {
      console.error('无效的图片URI:', uri);
      return '';
    }

    // Web平台特殊处理
    if (Platform.OS === 'web') {
      try {
        // 尝试将图片转换为Base64
        const base64Uri = await convertWebImageToBase64(uri);
        if (!base64Uri) {
          console.error('转换为Base64失败:', uri);
          return uri;
        }

        // 为Base64图片生成一个唯一ID
        const webImageId = `web_image_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

        // 保存Base64到AsyncStorage
        await AsyncStorage.setItem(webImageId, base64Uri);
        console.log('Web图片已保存:', webImageId);

        // 返回生成的ID
        return webImageId;
      } catch (e) {
        console.error('保存Web图片失败:', e);
        return uri;
      }
    }

    // 如果URI已经是我们保存的永久URI，直接返回
    if (uri.includes('images/image_')) {
      return uri;
    }

    const imageDir = await setupImageDirectory();
    const filename = `image_${Date.now()}_${Math.floor(Math.random() * 10000)}.jpg`;
    const destinationUri = `${imageDir}${filename}`;

    // 使用旧版 API 的 copyAsync
    await FileSystemLegacy.copyAsync({
      from: uri,
      to: destinationUri
    });

    // 保存URI映射到AsyncStorage，以便在应用重启后恢复
    try {
      const mappingStr = await AsyncStorage.getItem(IMAGE_MAPPING_KEY);
      const mapping = mappingStr ? JSON.parse(mappingStr) : {};
      mapping[uri] = destinationUri;
      await AsyncStorage.setItem(IMAGE_MAPPING_KEY, JSON.stringify(mapping));
      console.log('移动端图片已保存:', destinationUri);
    } catch (e) {
      console.error('保存图片映射失败:', e);
    }

    return destinationUri;
  } catch (error) {
    console.error('保存图片失败:', error);

    // 如果保存失败，尝试从映射中查找
    try {
      const mappingStr = await AsyncStorage.getItem(IMAGE_MAPPING_KEY);
      const mapping = mappingStr ? JSON.parse(mappingStr) : {};
      if (mapping[uri]) {
        return mapping[uri];
      }
    } catch (e) {
      console.error('查找图片映射失败:', e);
    }
    return uri; // 最终失败时返回原始 URI
  }
};

// 保存多张图片
export const saveMultipleImages = async (uris: string[]): Promise<string[]> => {
  if (!uris || !Array.isArray(uris)) {
    console.error('无效的图片URI数组:', uris);
    return [];
  }

  const validUris = uris.filter(uri => uri && typeof uri === 'string');
  console.log('开始保存多张图片:', validUris.length);

  const savedUris = await Promise.all(
    validUris.map(uri => saveImageToPermanentStorage(uri))
  );

  console.log('多张图片保存完成:', savedUris);
  return savedUris.filter(uri => uri); // 过滤掉空字符串
};

// 获取图片的实际URI（用于首页加载时）
export const getActualImageUri = async (uri: string): Promise<string> => {
  // 检查URI是否有效
  if (!uri || typeof uri !== 'string') {
    console.error('无效的图片URI:', uri);
    return '';
  }

  // Web平台特殊处理
  if (Platform.OS === 'web') {
    // 检查是否是我们生成的Web图片ID
    if (uri.startsWith('web_image_')) {
      try {
        const base64Uri = await AsyncStorage.getItem(uri);
        if (base64Uri) {
          return base64Uri;
        } else {
          console.error('未找到Web图片:', uri);
        }
      } catch (e) {
        console.error('获取Web图片失败:', e);
      }
    }
    return uri;
  }

  // 如果URI已经是我们保存的永久URI，直接返回
  if (uri.includes('images/image_')) {
    return uri;
  }

  // 尝试从映射中查找
  try {
    const mappingStr = await AsyncStorage.getItem(IMAGE_MAPPING_KEY);
    const mapping = mappingStr ? JSON.parse(mappingStr) : {};
    if (mapping[uri]) {
      return mapping[uri];
    }
  } catch (e) {
    console.error('查找图片映射失败:', e);
  }

  return uri; // 没找到映射时返回原始 URI
};