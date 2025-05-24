import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, ActivityIndicator, Modal, ImageSourcePropType, Platform, Switch, TextInput, Alert } from 'react-native';
import useAuth from '../../hooks/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppNavigationPropsType } from '../../navigation/AppNavigationPropsType';
import cities from '../../assets/data/cities.json';
import { getCategories, getCategory } from '../../services/webapi';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface City {
  name: string;
  lat: number;
  lon: number;
}

interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    description: string;
    main: string;
  }>;
  wind: {
    speed: number;
  };
}

interface ClothingItem {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  imagePath?: string; // Bu düzeltildi
}


interface WardrobeData {
  upperwear: ClothingItem[];
  bottomwear: ClothingItem[];
  footwear: ClothingItem[];
  accessories: ClothingItem[];
}

const apiKey = "e4802f53135adaf9fe32403d35b6a3ed";
const apiBase = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://127.0.0.1:8000';

const ProfilePage = () => {
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<AppNavigationPropsType>>();
  const [loading, setLoading] = useState(false);
  const [showAllCities, setShowAllCities] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [wardrobeData, setWardrobeData] = useState<WardrobeData>({
    upperwear: [],
    bottomwear: [],
    footwear: [],
    accessories: []
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [images, setImages] = useState<ClothingItem[]>([]);
  const [upperwearImages, setUpperwearImages] = useState<ClothingItem[]>([]);
  const [bottomwearImages, setBottomwearImages] = useState<ClothingItem[]>([]);
  const [footwearImages, setFootwearImages] = useState<ClothingItem[]>([]);
  const [accessoriesImages, setAccessoriesImages] = useState<ClothingItem[]>([]);
  const [editProfileModal, setEditProfileModal] = useState(false);
  const [changePasswordModal, setChangePasswordModal] = useState(false);
  const [notificationModal, setNotificationModal] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email] = useState(user?.email || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordRepeat, setNewPasswordRepeat] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [outfitSuggestion, setOutfitSuggestion] = useState<any[]>([]);
  const [outfitLoading, setOutfitLoading] = useState(false);
  const [outfitError, setOutfitError] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);

  const upperwearScrollRef = useRef<ScrollView>(null);
  const bottomwearScrollRef = useRef<ScrollView>(null);
  const footwearScrollRef = useRef<ScrollView>(null);
  const accessoriesScrollRef = useRef<ScrollView>(null);

  const fetchWeather = async (city: City) => {
    setWeatherLoading(true);
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${apiKey}&units=metric&lang=tr`;
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        setWeatherData(data);
      }
    } catch (error) {
      console.error('Hava durumu bilgisi alınamadı:', error);
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleCityPress = async (city: City) => {
    setSelectedCity(city);
    setModalVisible(true);
    await fetchWeather(city);
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      navigation.navigate('Welcome');
    } catch (error) {
      console.error('Çıkış yapılırken bir hata oluştu:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load wardrobe data from web api
    const loadWardrobeData = async () => {
      try {
        // Kategorileri çek
        const categories: string[] = await getCategories();
        const wardrobe: any = {
          upperwear: [],
          bottomwear: [],
          footwear: [],
          accessories: []
        };
        // Her kategori için ürünleri çek
        for (const category of categories) {
          const items = await getCategory(category);
          wardrobe[category] = items;
        }
        setWardrobeData(wardrobe);
      } catch (error) {
        console.error('Gardırop verileri web apiden yüklenirken hata oluştu:', error);
      }
    };
    loadWardrobeData();
  }, []);

  useEffect(() => {
    fetch(`${apiBase}/categories`)
      .then(res => res.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedCategory) {
      setSubcategories([]);
      setSelectedSubcategory('');
      return;
    }
    fetch(`${apiBase}/categories/${selectedCategory}`)
      .then(res => res.json())
      .then(setSubcategories)
      .catch(console.error);
  }, [selectedCategory]);

  useEffect(() => {
    if (!selectedCategory || !selectedSubcategory) {
      setImages([]);
      return;
    }
    fetch(`${apiBase}/categories/${selectedCategory}/${selectedSubcategory}`)
      .then(res => res.json())
      .then(data => setImagesFromPaths(Array.isArray(data) ? data : [], selectedCategory))
      .catch(() => setImages([]));
  }, [selectedCategory, selectedSubcategory]);

  const setImagesFromPaths = (imgs: string[], category: string) => {
    const items: ClothingItem[] = imgs.map((img, idx) => ({
      id: img,
      name: '',
      category,
      subcategory: '',
      imagePath: img
    }));
    setImages(items);
  };

  const handleCategoryImages = async (category: string) => {
    try {
      const res = await fetch(`${apiBase}/categories/${category}`);
      const subcats: string[] = await res.json();
      if (subcats.length === 0) {
        updateImages(category, []);
        return;
      }
      const randomSub = subcats[Math.floor(Math.random() * subcats.length)];
      const imgRes = await fetch(`${apiBase}/categories/${category}/${randomSub}`);
      const imgs: string[] = await imgRes.json();
      updateImages(category, imgs);
      // Scroll işlemi: görseller state'e yazıldıktan sonra kısa bir gecikme ile scrollTo çağır
      setTimeout(() => {
        const scrollX = Math.max(0, (imgs.length - 1) * 120);
        if (category === 'upperwear' && upperwearScrollRef.current) {
          upperwearScrollRef.current.scrollTo({ x: scrollX, animated: true });
        }
        if (category === 'bottomwear' && bottomwearScrollRef.current) {
          bottomwearScrollRef.current.scrollTo({ x: scrollX, animated: true });
        }
        if (category === 'footwear' && footwearScrollRef.current) {
          footwearScrollRef.current.scrollTo({ x: scrollX, animated: true });
        }
        if (category === 'accessories' && accessoriesScrollRef.current) {
          accessoriesScrollRef.current.scrollTo({ x: scrollX, animated: true });
        }
      }, 200);
    } catch (err) {
      updateImages(category, []);
      console.error('Kategori random görsel hatası:', err);
    }
  };

  const updateImages = (category: string, imgs: string[]) => {
    const items: ClothingItem[] = imgs.map((img, idx) => ({
      id: img,
      name: '',
      category,
      subcategory: '',
      imagePath: img
    }));
    if (category === 'upperwear') setUpperwearImages(items);
    if (category === 'bottomwear') setBottomwearImages(items);
    if (category === 'footwear') setFootwearImages(items);
    if (category === 'accessories') setAccessoriesImages(items);
  };

  // Tek random kombin önerisi çekme fonksiyonu
  const fetchOutfitSuggestion = async () => {
    setOutfitLoading(true);
    setOutfitError('');
    try {
      const categories = await getCategories();
      const selectedCategories = ['upperwear', 'bottomwear', 'footwear'];
      const suggestion: any[] = [];
      for (const cat of selectedCategories) {
        if (categories.includes(cat)) {
          const items = await getCategory(cat);
          if (items && items.length > 0) {
            // Rastgele bir ürün seç
            const randomItem = items[Math.floor(Math.random() * items.length)];
            suggestion.push(randomItem);
          }
        }
      }
      setOutfitSuggestion(suggestion);
    } catch (err) {
      setOutfitError('Kombin önerisi alınamadı.');
    } finally {
      setOutfitLoading(false);
    }
  };

  useEffect(() => {
    fetchOutfitSuggestion();
  }, []);

  const toggleFavorite = async (item: ClothingItem) => {
    let newFavs: ClothingItem[] = [];
    const favData = await AsyncStorage.getItem('favorites');
    if (favData) {
      newFavs = JSON.parse(favData);
    }
    const exists = newFavs.some(fav => fav.imagePath === item.imagePath);
    if (exists) {
      newFavs = newFavs.filter(fav => fav.imagePath !== item.imagePath);
    } else {
      newFavs = [...newFavs, item];
    }
    setFavorites(newFavs.map(fav => fav.imagePath ?? '').filter(Boolean));
    await AsyncStorage.setItem('favorites', JSON.stringify(newFavs));
    if (!exists) {
      Alert.alert('Başarılı', 'Ürün favorilere eklendi!');
      navigation.navigate('Favorite');
    }
  };

  useEffect(() => {
    AsyncStorage.getItem('favorites').then(data => {
      if (data) setFavorites(JSON.parse(data));
    });
  }, []);

  if (!user) {
    return null;
  }

  const renderWardrobeSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Kişisel Gardırobum</Text>
      {/* Galeri Alanı */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
        {Array.isArray(images) && images.length === 0 ? (
          <Text style={{ color: '#888', alignSelf: 'center', marginLeft: 10 }}>Görsel yok</Text>
        ) : (
          Array.isArray(images) && images.map((item, idx) => (
            <View key={(item.imagePath || '') + idx} style={{ position: 'relative', marginRight: 10 }}>
              <Image
                source={{ uri: apiBase + item.imagePath }}
                style={styles.itemImage}
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => toggleFavorite(item)}
                style={{ position: 'absolute', top: 8, right: 8, zIndex: 2, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: 2 }}
              >
                <Text style={{ fontSize: 22, color: favorites.includes(item.imagePath || '') ? 'red' : '#bbb' }}>♥</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
      {/* Kategori ve Alt Kategori Seçimi */}
      <View style={{ marginBottom: 10 }}>
        <Text style={{ fontWeight: '600', marginBottom: 4 }}>Ana Kategori:</Text>
        <Picker
          selectedValue={selectedCategory}
          onValueChange={setSelectedCategory}
          style={{ backgroundColor: '#F8F9FA', borderRadius: 8 }}
        >
          <Picker.Item label="Seçin" value="" />
          {categories.map(cat => (
            <Picker.Item key={cat} label={cat} value={cat} />
          ))}
        </Picker>
        <Text style={{ fontWeight: '600', marginBottom: 4, marginTop: 8 }}>Alt Kategori:</Text>
        <Picker
          selectedValue={selectedSubcategory}
          onValueChange={setSelectedSubcategory}
          style={{ backgroundColor: '#F8F9FA', borderRadius: 8 }}
          enabled={!!selectedCategory}
        >
          <Picker.Item label="Seçin" value="" />
          {subcategories.map(sub => (
            <Picker.Item key={sub} label={sub} value={sub} />
          ))}
        </Picker>
      </View>
      {/* Üst Giyim */}
      <View style={styles.wardrobeCategory}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Product', { category: 'upperwear' })}
          style={styles.categoryButton}
        >
          <Text style={styles.categoryTitle}>Üst Giyim</Text>
          <Text style={styles.categoryArrow}>→</Text>
        </TouchableOpacity>
        <ScrollView ref={upperwearScrollRef} horizontal showsHorizontalScrollIndicator={false} style={styles.wardrobeItems}>
          {upperwearImages.length === 0 ? (
            <Text style={{color: '#888'}}>Resim Yok</Text>
          ) : (
            upperwearImages.map((item, idx) => (
              <View key={(item.imagePath || '') + idx} style={{ position: 'relative', marginRight: 10 }}>
                <Image
                  source={{ uri: apiBase + item.imagePath }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => toggleFavorite(item)}
                  style={{ position: 'absolute', top: 8, right: 8, zIndex: 2, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: 2 }}
                >
                  <Text style={{ fontSize: 22, color: favorites.includes(item.imagePath || '') ? 'red' : '#bbb' }}>♥</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      {/* Alt Giyim */}
      <View style={styles.wardrobeCategory}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Product', { category: 'bottomwear' })}
          style={styles.categoryButton}
        >
          <Text style={styles.categoryTitle}>Alt Giyim</Text>
          <Text style={styles.categoryArrow}>→</Text>
        </TouchableOpacity>
        <ScrollView ref={bottomwearScrollRef} horizontal showsHorizontalScrollIndicator={false} style={styles.wardrobeItems}>
          {bottomwearImages.length === 0 ? (
            <Text style={{color: '#888'}}>Resim Yok</Text>
          ) : (
            bottomwearImages.map((item, idx) => (
              <View key={(item.imagePath || '') + idx} style={{ position: 'relative', marginRight: 10 }}>
                <Image
                  source={{ uri: apiBase + item.imagePath }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => toggleFavorite(item)}
                  style={{ position: 'absolute', top: 8, right: 8, zIndex: 2, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: 2 }}
                >
                  <Text style={{ fontSize: 22, color: favorites.includes(item.imagePath || '') ? 'red' : '#bbb' }}>♥</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      {/* Ayakkabı */}
      <View style={styles.wardrobeCategory}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Product', { category: 'footwear' })}
          style={styles.categoryButton}
        >
          <Text style={styles.categoryTitle}>Ayakkabı</Text>
          <Text style={styles.categoryArrow}>→</Text>
        </TouchableOpacity>
        <ScrollView ref={footwearScrollRef} horizontal showsHorizontalScrollIndicator={false} style={styles.wardrobeItems}>
          {footwearImages.length === 0 ? (
            <Text style={{color: '#888'}}>Resim Yok</Text>
          ) : (
            footwearImages.map((item, idx) => (
              <View key={(item.imagePath || '') + idx} style={{ position: 'relative', marginRight: 10 }}>
                <Image
                  source={{ uri: apiBase + item.imagePath }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => toggleFavorite(item)}
                  style={{ position: 'absolute', top: 8, right: 8, zIndex: 2, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: 2 }}
                >
                  <Text style={{ fontSize: 22, color: favorites.includes(item.imagePath || '') ? 'red' : '#bbb' }}>♥</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      {/* Aksesuarlar */}
      <View style={styles.wardrobeCategory}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Product', { category: 'accessories' })}
          style={styles.categoryButton}
        >
          <Text style={styles.categoryTitle}>Aksesuarlar</Text>
          <Text style={styles.categoryArrow}>→</Text>
        </TouchableOpacity>
        <ScrollView ref={accessoriesScrollRef} horizontal showsHorizontalScrollIndicator={false} style={styles.wardrobeItems}>
          {accessoriesImages.length === 0 ? (
            <Text style={{color: '#888'}}>Resim Yok</Text>
          ) : (
            accessoriesImages.map((item, idx) => (
              <View key={(item.imagePath || '') + idx} style={{ position: 'relative', marginRight: 10 }}>
                <Image
                  source={{ uri: apiBase + item.imagePath }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => toggleFavorite(item)}
                  style={{ position: 'absolute', top: 8, right: 8, zIndex: 2, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: 2 }}
                >
                  <Text style={{ fontSize: 22, color: favorites.includes(item.imagePath || '') ? 'red' : '#bbb' }}>♥</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Yeni Kıyafet Ekle</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Profil Başlığı */}
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <Image
            source={user.photoURL ? { uri: user.photoURL } : require('../../assets/images/user.jpg')}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Düzenle</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{user.displayName || 'Kullanıcı'}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      {/* Favorilerim butonu */}
      <TouchableOpacity
        style={{
          backgroundColor: '#FF4B91',
          padding: 12,
          borderRadius: 10,
          alignItems: 'center',
          margin: 16,
          marginBottom: 8,
        }}
        onPress={() => navigation.navigate('Favorite')}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Favorilerim</Text>
      </TouchableOpacity>

      {/* Ana Sayfa butonu */}
      <TouchableOpacity
        style={{
          backgroundColor: '#4B91FF',
          padding: 12,
          borderRadius: 10,
          alignItems: 'center',
          margin: 16,
          marginTop: 0,
        }}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Ana Sayfaya Git</Text>
      </TouchableOpacity>

      {/* Favori Şehirler */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Favori Şehirlerim</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.favoriteCities}>
          <TouchableOpacity 
            style={styles.cityCard}
            onPress={() => handleCityPress(cities.find(c => c.name === 'İstanbul')!)}
          >
            <Text style={styles.cityName}>İstanbul</Text>
            <Text style={styles.cityTemp}>23°C</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.cityCard}
            onPress={() => handleCityPress(cities.find(c => c.name === 'Ankara')!)}
          >
            <Text style={styles.cityName}>Ankara</Text>
            <Text style={styles.cityTemp}>25°C</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.cityCard}
            onPress={() => handleCityPress(cities.find(c => c.name === 'İzmir')!)}
          >
            <Text style={styles.cityName}>İzmir</Text>
            <Text style={styles.cityTemp}>28°C</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Tüm Şehirler */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tüm Şehirler</Text>
          <TouchableOpacity 
            style={styles.toggleButton}
            onPress={() => setShowAllCities(!showAllCities)}
          >
            <Text style={styles.toggleButtonText}>
              {showAllCities ? 'Gizle' : 'Göster'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {showAllCities && (
          <View style={styles.allCitiesContainer}>
            {cities.map((city: City, index: number) => (
              <TouchableOpacity 
                key={city.name} 
                style={[
                  styles.cityCard,
                  index % 2 === 0 ? styles.evenCard : styles.oddCard
                ]}
                onPress={() => handleCityPress(city)}
              >
                <Text style={styles.cityName}>{city.name}</Text>
                <Text style={styles.cityTemp}>--°C</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Hava Durumu Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedCity?.name}</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {weatherLoading ? (
              <ActivityIndicator size="large" color="#FF4B91" />
            ) : weatherData ? (
              <View style={styles.weatherInfo}>
                <Text style={styles.temperature}>
                  {Math.round(weatherData.main.temp)}°C
                </Text>
                <Text style={styles.weatherDescription}>
                  {weatherData.weather[0].description}
                </Text>
                <View style={styles.weatherDetails}>
                  <View style={styles.weatherDetail}>
                    <Text style={styles.detailLabel}>Hissedilen</Text>
                    <Text style={styles.detailValue}>
                      {Math.round(weatherData.main.feels_like)}°C
                    </Text>
                  </View>
                  <View style={styles.weatherDetail}>
                    <Text style={styles.detailLabel}>Nem</Text>
                    <Text style={styles.detailValue}>
                      {weatherData.main.humidity}%
                    </Text>
                  </View>
                  <View style={styles.weatherDetail}>
                    <Text style={styles.detailLabel}>Rüzgar</Text>
                    <Text style={styles.detailValue}>
                      {weatherData.wind.speed} m/s
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <Text style={styles.errorText}>Hava durumu bilgisi alınamadı</Text>
            )}
          </View>
        </View>
      </Modal>

      {renderWardrobeSection()}

      {/* Hesap Ayarları */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hesap Ayarları</Text>
        <TouchableOpacity style={styles.menuItem} onPress={() => setEditProfileModal(true)}>
          <Text style={styles.menuItemText}>Profil Bilgilerini Düzenle</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => setChangePasswordModal(true)}>
          <Text style={styles.menuItemText}>Şifre Değiştir</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => setNotificationModal(true)}>
          <Text style={styles.menuItemText}>Bildirim Ayarları</Text>
        </TouchableOpacity>
      </View>

      {/* Çıkış Yap Butonu */}
      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleLogout}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
        )}
      </TouchableOpacity>

      {/* Profil Bilgilerini Düzenle Modal */}
      <Modal visible={editProfileModal} transparent animationType="slide" onRequestClose={() => setEditProfileModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Profil Bilgilerini Düzenle</Text>
            <TextInput
              style={[styles.input, { marginBottom: 10 }]}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Kullanıcı Adı"
            />
            <TextInput
              style={[styles.input, { marginBottom: 20 }]}
              value={email}
              editable={false}
              placeholder="E-posta"
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity onPress={() => setEditProfileModal(false)} style={[styles.addButton, { backgroundColor: '#ccc', marginRight: 10 }]}> 
                <Text style={{ color: '#333' }}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditProfileModal(false)} style={styles.addButton}>
                <Text style={styles.addButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Şifre Değiştir Modal */}
      <Modal visible={changePasswordModal} transparent animationType="slide" onRequestClose={() => setChangePasswordModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Şifre Değiştir</Text>
            <TextInput
              style={[styles.input, { marginBottom: 10 }]}
              value={oldPassword}
              onChangeText={setOldPassword}
              placeholder="Eski Şifre"
              secureTextEntry
            />
            <TextInput
              style={[styles.input, { marginBottom: 10 }]}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Yeni Şifre"
              secureTextEntry
            />
            <TextInput
              style={[styles.input, { marginBottom: 20 }]}
              value={newPasswordRepeat}
              onChangeText={setNewPasswordRepeat}
              placeholder="Yeni Şifre (Tekrar)"
              secureTextEntry
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity onPress={() => setChangePasswordModal(false)} style={[styles.addButton, { backgroundColor: '#ccc', marginRight: 10 }]}> 
                <Text style={{ color: '#333' }}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setChangePasswordModal(false)} style={styles.addButton}>
                <Text style={styles.addButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bildirim Ayarları Modal */}
      <Modal visible={notificationModal} transparent animationType="slide" onRequestClose={() => setNotificationModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Bildirim Ayarları</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 16, marginRight: 10 }}>Bildirimler</Text>
              <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity onPress={() => setNotificationModal(false)} style={[styles.addButton, { backgroundColor: '#ccc', marginRight: 10 }]}> 
                <Text style={{ color: '#333' }}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setNotificationModal(false)} style={styles.addButton}>
                <Text style={styles.addButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4FF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#FF4B91',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF4B91',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 15,
  },
  favoriteCities: {
    flexDirection: 'row',
    marginHorizontal: -5,
  },
  cityCard: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 15,
    marginHorizontal: 5,
    minWidth: 120,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  cityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 5,
  },
  cityTemp: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF4B91',
  },
  outfitContainer: {
    marginTop: 10,
  },
  outfitCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  outfitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  outfitDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  outfitItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  outfitItem: {
    alignItems: 'center',
    flex: 1,
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#F0F0F0',
  },
  itemName: {
    fontSize: 14,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  menuItem: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  menuItemText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  logoutButton: {
    backgroundColor: '#FF4B91',
    margin: 16,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  toggleButton: {
    backgroundColor: '#FF4B91',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  toggleButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  allCitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  evenCard: {
    backgroundColor: '#F8F9FA',
  },
  oddCard: {
    backgroundColor: '#F0F4FF',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  weatherInfo: {
    alignItems: 'center',
    padding: 20,
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF4B91',
    marginBottom: 10,
  },
  weatherDescription: {
    fontSize: 20,
    color: '#666',
    marginBottom: 20,
    textTransform: 'capitalize',
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 15,
  },
  weatherDetail: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  wardrobeCategory: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  wardrobeItems: {
    flexDirection: 'row',
    marginHorizontal: -5,
  },
  wardrobeItem: {
    alignItems: 'center',
    marginHorizontal: 5,
    width: 100,
  },
  addButton: {
    backgroundColor: '#FF4B91',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
    color: '#1A1A1A',
  },
  categoryButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  categoryArrow: {
    fontSize: 20,
    color: '#FF4B91',
    fontWeight: 'bold',
  },
});

export default ProfilePage;