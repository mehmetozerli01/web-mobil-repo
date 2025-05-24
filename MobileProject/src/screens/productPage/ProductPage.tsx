import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { AppNavigationPropsType } from '../../navigation/AppNavigationPropsType';
import { getCategory } from '../../services/webapi';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ProductPageRouteProp = RouteProp<AppNavigationPropsType, 'Product'>;

const apiBase = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://127.0.0.1:8000';

const ProductPage = () => {
  const route = useRoute<ProductPageRouteProp>();
  const navigation = useNavigation();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const { category } = route.params;

  useEffect(() => {
    loadProducts();
    loadFavorites();
  }, [category]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Önce alt kategorileri al
      const subcategoriesRes = await fetch(`${apiBase}/categories/${category}`);
      if (!subcategoriesRes.ok) throw new Error('Alt kategoriler alınamadı');
      const subcategories = await subcategoriesRes.json();
      
      // Her alt kategori için ürünleri topla
      let allProducts: any[] = [];
      for (const subcategory of subcategories) {
        const imagesRes = await fetch(`${apiBase}/categories/${category}/${subcategory}`);
        if (!imagesRes.ok) continue;
        const images = await imagesRes.json();
        
        // Her resim için bir ürün objesi oluştur
        const products = images.map((imagePath: string) => ({
          name: imagePath.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'Ürün',
          subcategory: subcategory,
          imagePath: imagePath
        }));
        
        allProducts = [...allProducts, ...products];
      }
      
      // İlk 10 ürünü al
      setProducts(allProducts.slice(0, 10));
    } catch (error) {
      console.error('Ürünler yüklenirken hata oluştu:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const data = await AsyncStorage.getItem('favorites');
      if (data) {
        setFavorites(JSON.parse(data));
      }
    } catch (error) {
      console.error('Favoriler yüklenirken hata oluştu:', error);
    }
  };

  const toggleFavorite = async (imagePath: string) => {
    try {
      let newFavorites;
      if (favorites.includes(imagePath)) {
        newFavorites = favorites.filter(fav => fav !== imagePath);
      } else {
        newFavorites = [...favorites, imagePath];
      }
      setFavorites(newFavorites);
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Favori eklenirken hata oluştu:', error);
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'upperwear':
        return 'Üst Giyim';
      case 'bottomwear':
        return 'Alt Giyim';
      case 'footwear':
        return 'Ayakkabı';
      case 'accessories':
        return 'Aksesuar';
      default:
        return category;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4B91" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{getCategoryTitle(category)}</Text>
      </View>

      <ScrollView style={styles.productList}>
        {products.length === 0 ? (
          <Text style={styles.noProducts}>Bu kategoride ürün bulunamadı</Text>
        ) : (
          products.map((product, index) => (
            <View key={index} style={styles.productCard}>
              <Image
                source={{ uri: apiBase + product.imagePath }}
                style={styles.productImage}
                resizeMode="cover"
                onError={(e) => console.error('Resim yüklenirken hata:', e.nativeEvent.error)}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productCategory}>{product.subcategory}</Text>
              </View>
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={() => toggleFavorite(product.imagePath)}
              >
                <Text style={[
                  styles.favoriteIcon,
                  { color: favorites.includes(product.imagePath) ? '#FF4B91' : '#ccc' }
                ]}>♥</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 18,
    color: '#FF4B91',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  productList: {
    padding: 16,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F0F0F0',
  },
  productInfo: {
    padding: 15,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 5,
  },
  productCategory: {
    fontSize: 14,
    color: '#666666',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 8,
  },
  favoriteIcon: {
    fontSize: 24,
  },
  noProducts: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666666',
    marginTop: 20,
  },
});

export default ProductPage; 