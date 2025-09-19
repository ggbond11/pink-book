import AsyncStorage from '@react-native-async-storage/async-storage';

export type Post = {
  id: number;
  title: string;
  summary: string;
  images?: string[];
};

const POSTS_KEY = 'posts';

export async function getAllPosts(): Promise<Post[]> {
  const postsStr = await AsyncStorage.getItem(POSTS_KEY);
  if (!postsStr) return [];
  try {
    return JSON.parse(postsStr);
  } catch {
    return [];
  }
}

export async function saveAllPosts(posts: Post[]): Promise<void> {
  await AsyncStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}

export async function addPost(newPost: Post): Promise<void> {
  const posts = await getAllPosts();
  posts.unshift(newPost);
  await saveAllPosts(posts);
}