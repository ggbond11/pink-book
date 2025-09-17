import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Dimensions, Platform, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS, FONTS } from './theme';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { loginUser } from './userStorage';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 600;



export default function LoginScreen() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const handleLogin = async () => {
    setError('');
    if (!account || !password) {
      setError('请输入账号和密码');
      return;
    }
    const res = await loginUser(account, password);
    if (res.success) {
      navigation.navigate('Home');
    } else {
      setError(res.message);
    }
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require('./assets/logo.svg')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.logoText}>小粉书</Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="邮箱/手机号"
          placeholderTextColor="#888"
          value={account}
          onChangeText={setAccount}
        />
        <TextInput
          style={styles.input}
          placeholder="密码"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>
      {error ? <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text> : null}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>登录</Text>
      </TouchableOpacity>
      <TouchableOpacity>
        <Text style={styles.linkText}>忘记密码?</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>注册新账号</Text>
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
  loginButton: {
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
  loginButtonText: {
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
