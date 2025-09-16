import AsyncStorage from '@react-native-async-storage/async-storage';

export type User = {
  email: string;
  phone: string;
  password: string;
};

const USERS_KEY = 'users';

// 获取所有用户
export async function getAllUsers(): Promise<User[]> {
  const usersStr = await AsyncStorage.getItem(USERS_KEY);
  if (!usersStr) return [];
  try {
    return JSON.parse(usersStr);
  } catch {
    return [];
  }
}

// 注册用户
export async function registerUser(newUser: User): Promise<{ success: boolean; message: string }> {
  const users = await getAllUsers();
  // 检查邮箱或手机号是否已注册
  if (users.some(u => u.email === newUser.email || u.phone === newUser.phone)) {
    return { success: false, message: '邮箱或手机号已注册' };
  }
  users.push(newUser);
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
  return { success: true, message: '注册成功' };
}

// 登录校验
export async function loginUser(account: string, password: string): Promise<{ success: boolean; user?: User; message: string }> {
  const users = await getAllUsers();
  const user = users.find(u => (u.email === account || u.phone === account) && u.password === password);
  if (user) {
    return { success: true, user, message: '登录成功' };
  }
  return { success: false, message: '用户名或密码错误' };
}