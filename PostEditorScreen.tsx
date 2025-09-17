import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ScrollView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS } from './theme';


export default function PostEditorScreen({ route }: any) {
  const navigation = useNavigation<any>();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [images, setImages] = useState<string[]>([]);

  // 选择图片
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets) {
      setImages([...images, ...result.assets.map(a => a.uri)]);
    }
  };

  // 拍照
  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });
    if (!result.canceled && result.assets) {
      setImages([...images, ...result.assets.map(a => a.uri)]);
    }
  };


  // 发布帖子
  const handlePublish = () => {
    if (!title.trim() && !text.trim() && images.length === 0) {
      alert('请输入标题、内容或添加图片');
      return;
    }
    // 回传数据到首页
    navigation.navigate('Home', { newPost: { title, text, images } });
  };

  return (
    <View style={styles.fullScreen}>
      {/* 顶部栏 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>发布新帖</Text>
      </View>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TextInput
          style={styles.titleInput}
          placeholder="请输入标题"
          placeholderTextColor={COLORS.gray}
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="写点什么..."
          placeholderTextColor={COLORS.gray}
          multiline
          value={text}
          onChangeText={setText}
        />
        <View style={styles.imageRow}>
          {images.map((uri, idx) => (
            <Image key={idx} source={{ uri }} style={styles.image} />
          ))}
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
            <Text style={styles.actionButtonText}>相册</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
            <Text style={styles.actionButtonText}>拍照</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.publishButton} onPress={handlePublish}>
          <Text style={styles.publishButtonText}>发布</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: COLORS.primaryLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
  },
  backBtn: {
    padding: 8,
    marginRight: 8,
  },
  backText: {
    color: COLORS.white,
    fontSize: 22,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: FONTS.base,
  },
  container: {
    padding: 20,
    flexGrow: 1,
  },
  titleInput: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    minHeight: 40,
    padding: 12,
    fontSize: 17,
    color: '#222',
    marginBottom: 14,
    fontFamily: FONTS.base,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    minHeight: 100,
    padding: 14,
    fontSize: 16,
    color: '#222',
    marginBottom: 16,
    fontFamily: FONTS.base,
  },
  imageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginRight: 12,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.base,
  },
  publishButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  publishButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: FONTS.base,
  },
});
