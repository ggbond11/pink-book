import { Platform } from 'react-native';
// 全局样式变量
export const COLORS = {
  primary: '#ff5fa2', // 主色调 粉色
  primaryLight: '#fde6ee', // 主背景淡粉色
  white: '#fff',
  gray: '#888',
  grayLight: '#eee',
  cardShadow: '#ffb6d5',
  wechat: '#4caf50',
  facebook: '#294e8f',
};


export const FONTS = {
  base: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
};