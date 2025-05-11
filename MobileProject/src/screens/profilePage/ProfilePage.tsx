import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, ActivityIndicator, Modal, ImageSourcePropType } from 'react-native';
import useAuth from '../../hooks/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useNavigation } from '@react-navigation/native';
import cities from '../../assets/data/cities.json';

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
  imagePath: ImageSourcePropType;
}

interface WardrobeData {
  upperwear: ClothingItem[];
  bottomwear: ClothingItem[];
  footwear: ClothingItem[];
  accessories: ClothingItem[];
}

const apiKey = "e4802f53135adaf9fe32403d35b6a3ed";

const ProfilePage = () => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
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
    // Load wardrobe data
    const loadWardrobeData = async () => {
      try {
        // Üst giyim verilerini yükle
        const upperwearItems: ClothingItem[] = [
          {
            id: 'tshirt1',
            name: 'Tişört',
            category: 'upperwear',
            subcategory: 'tshirt',
            imagePath: require('../../../web/assets/data/clothes/upperwear/tshirt/upperwear_tshirt3967.png')
          },
          {
            id: 'tshirt2',
            name: 'Tişört',
            category: 'upperwear',
            subcategory: 'tshirt',
            imagePath: require('../../../web/assets/data/clothes/upperwear/tshirt/upperwear_tshirt3963.png')
          },
          {
            id: 'tshirt3',
            name: 'Tişört',
            category: 'upperwear',
            subcategory: 'tshirt',
            imagePath: require('../../../web/assets/data/clothes/upperwear/tshirt/upperwear_tshirt3960.png')
          }
        ];

        // Alt giyim verilerini yükle
        const bottomwearItems: ClothingItem[] = [
          {
            id: 'pants1',
            name: 'Pantolon',
            category: 'bottomwear',
            subcategory: 'pants',
            imagePath: require('../../../web/assets/data/clothes/bottomwear/pants/bottomwear_pants4621.png')
          },
          {
            id: 'pants2',
            name: 'Pantolon',
            category: 'bottomwear',
            subcategory: 'pants',
            imagePath: require('../../../web/assets/data/clothes/bottomwear/pants/bottomwear_pants4609.png')
          },
          {
            id: 'pants3',
            name: 'Pantolon',
            category: 'bottomwear',
            subcategory: 'pants',
            imagePath: require('../../../web/assets/data/clothes/bottomwear/pants/bottomwear_pants4598.png')
          }
        ];

        // Ayakkabı verilerini yükle
        const footwearItems: ClothingItem[] = [
          {
            id: 'sneakers1',
            name: 'Spor Ayakkabı',
            category: 'footwear',
            subcategory: 'sneakers',
            imagePath: require('../../../web/assets/data/clothes/footwear/sneakers/963.png')
          },
          {
            id: 'sneakers2',
            name: 'Spor Ayakkabı',
            category: 'footwear',
            subcategory: 'sneakers',
            imagePath: require('../../../web/assets/data/clothes/footwear/sneakers/960.png')
          },
          {
            id: 'sneakers3',
            name: 'Spor Ayakkabı',
            category: 'footwear',
            subcategory: 'sneakers',
            imagePath: require('../../../web/assets/data/clothes/footwear/sneakers/938.png')
          }
        ];

        // Aksesuar verilerini yükle
        const accessoriesItems: ClothingItem[] = [
          {
            id: 'hat1',
            name: 'Şapka',
            category: 'accessories',
            subcategory: 'hat',
            imagePath: require('../../../web/assets/data/clothes/accessories/hat/accessories_hat979.png')
          },
          {
            id: 'hat2',
            name: 'Şapka',
            category: 'accessories',
            subcategory: 'hat',
            imagePath: require('../../../web/assets/data/clothes/accessories/hat/accessories_hat976.png')
          },
          {
            id: 'bag1',
            name: 'Çanta',
            category: 'accessories',
            subcategory: 'bag',
            imagePath: require('../../../web/assets/data/clothes/accessories/bag/accessories_bag14205.png')
          },
          {
            id: 'bag2',
            name: 'Çanta',
            category: 'accessories',
            subcategory: 'bag',
            imagePath: require('../../../web/assets/data/clothes/accessories/bag/accessories_bag14201.png')
          }
        ];

        setWardrobeData({
          upperwear: upperwearItems,
          bottomwear: bottomwearItems,
          footwear: footwearItems,
          accessories: accessoriesItems
        });
      } catch (error) {
        console.error('Gardırop verileri yüklenirken hata oluştu:', error);
      }
    };

    loadWardrobeData();
  }, []);

  if (!user) {
    return null;
  }

  const renderWardrobeSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Kişisel Gardırobum</Text>
      
      {/* Üst Giyim */}
      <View style={styles.wardrobeCategory}>
        <Text style={styles.categoryTitle}>Üst Giyim</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.wardrobeItems}>
          {wardrobeData.upperwear.map((item) => (
            <TouchableOpacity key={item.id} style={styles.wardrobeItem}>
              <Image
                source={item.imagePath}
                style={styles.itemImage}
                resizeMode="cover"
              />
              <Text style={styles.itemName}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Alt Giyim */}
      <View style={styles.wardrobeCategory}>
        <Text style={styles.categoryTitle}>Alt Giyim</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.wardrobeItems}>
          {wardrobeData.bottomwear.map((item) => (
            <TouchableOpacity key={item.id} style={styles.wardrobeItem}>
              <Image
                source={item.imagePath}
                style={styles.itemImage}
                resizeMode="cover"
              />
              <Text style={styles.itemName}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Ayakkabı */}
      <View style={styles.wardrobeCategory}>
        <Text style={styles.categoryTitle}>Ayakkabı</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.wardrobeItems}>
          {wardrobeData.footwear.map((item) => (
            <TouchableOpacity key={item.id} style={styles.wardrobeItem}>
              <Image
                source={item.imagePath}
                style={styles.itemImage}
                resizeMode="cover"
              />
              <Text style={styles.itemName}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Aksesuarlar */}
      <View style={styles.wardrobeCategory}>
        <Text style={styles.categoryTitle}>Aksesuarlar</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.wardrobeItems}>
          {wardrobeData.accessories.map((item) => (
            <TouchableOpacity key={item.id} style={styles.wardrobeItem}>
              <Image
                source={item.imagePath}
                style={styles.itemImage}
                resizeMode="cover"
              />
              <Text style={styles.itemName}>{item.name}</Text>
            </TouchableOpacity>
          ))}
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
            source={{ uri: user.photoURL || 'https://via.placeholder.com/120' }}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Düzenle</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{user.displayName || 'Kullanıcı'}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

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

      {/* Son Kombin Önerileri */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Son Kombin Önerilerim</Text>
        <View style={styles.outfitContainer}>
          <View style={styles.outfitCard}>
            <View style={styles.outfitHeader}>
              <Text style={styles.outfitDate}>Bugün</Text>
              <Text style={styles.outfitTemp}>23°C</Text>
            </View>
            <View style={styles.outfitItems}>
              <View style={styles.outfitItem}>
                <View style={[styles.itemImage, { backgroundColor: '#FFE5E5' }]} />
                <Text style={styles.itemName}>Tişört</Text>
              </View>
              <View style={styles.outfitItem}>
                <View style={[styles.itemImage, { backgroundColor: '#E5E5FF' }]} />
                <Text style={styles.itemName}>Şort</Text>
              </View>
              <View style={styles.outfitItem}>
                <View style={[styles.itemImage, { backgroundColor: '#E5FFE5' }]} />
                <Text style={styles.itemName}>Spor Ayakkabı</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Hesap Ayarları */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hesap Ayarları</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Profil Bilgilerini Düzenle</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Şifre Değiştir</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
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
  outfitTemp: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF4B91',
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
});

export default ProfilePage;