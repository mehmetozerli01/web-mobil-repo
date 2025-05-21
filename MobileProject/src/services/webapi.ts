import { Platform } from 'react-native';

const apiBase = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://127.0.0.1:8000';

export async function getCategories() {
  try {
    const response = await fetch(`${apiBase}/categories`);
    if (!response.ok) throw new Error('Kategori listesi alınamadı');
    return await response.json();
  } catch (error) {
    console.error("Kategori alma hatası:", error);
    throw error;
  }
}

export async function getCategory(category: string) {
  try {
    const response = await fetch(`${apiBase}/categories/${category}`);
    if (!response.ok) throw new Error(`Kategori (${category}) alınamadı`);
    return await response.json();
  } catch (error) {
    console.error("Kategori detay hatası:", error);
    throw error;
  }
}

export async function getRandomSub(category: string, randomSub: string) {
  try {
    const response = await fetch(`${apiBase}/categories/${category}/${randomSub}`);
    if (!response.ok) throw new Error('Alt kategori alınamadı');
    return await response.json();
  } catch (error) {
    console.error("Alt kategori alma hatası:", error);
    throw error;
  }
}
