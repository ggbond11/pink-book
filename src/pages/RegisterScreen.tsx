import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Dimensions, Platform, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS, FONTS } from '../styles/theme';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { registerUser } from '../utils/userStorage';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 600;

export default function RegisterScreen() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const handleRegister = async () => {
    setError('');
    setSuccess('');
    if (!email || !phone || !password || !confirmPassword) {
      setError('请填写所有信息');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次密码不一致');
      return;
    }
    const res = await registerUser({ email, phone, password });
    if (res.success) {
      setSuccess('注册成功，请登录');
      setTimeout(() => navigation.navigate('Login'), 1000);
    } else {
      setError(res.message);
    }
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require('../../assets/logo.svg')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.logoText}>注册账号</Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="邮箱"
          placeholderTextColor={COLORS.gray}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="手机号"
          placeholderTextColor={COLORS.gray}
          value={phone}
          onChangeText={setPhone}
        />
        <TextInput
          style={styles.input}
          placeholder="设置密码"
          placeholderTextColor={COLORS.gray}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="确认密码"
          placeholderTextColor={COLORS.gray}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>
      {error ? <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text> : null}
      {success ? <Text style={{ color: 'green', marginBottom: 8 }}>{success}</Text> : null}
      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.registerButtonText}>注册</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>已有账号？去登录</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 40,
    minHeight: height,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: isTablet ? 120 : 80,
    height: isTablet ? 120 : 80,
    marginBottom: 10,
  },
  logoText: {
    fontSize: isTablet ? 22 : 18,
    color: '#333',
    fontWeight: '500',
    marginBottom: 20,
    fontFamily: FONTS.base,
  },
  inputContainer: {
    width: '90%',
    maxWidth: 400,
    marginBottom: 10,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: isTablet ? 18 : 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    fontFamily: FONTS.base,
  },
  registerButton: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  registerButtonText: {
    color: COLORS.white,
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    fontFamily: FONTS.base,
  },
  linkText: {
    color: COLORS.gray,
    fontSize: isTablet ? 16 : 14,
    textAlign: 'center',
    marginBottom: 6,
    textDecorationLine: 'underline',
    fontFamily: FONTS.base,
  },
});