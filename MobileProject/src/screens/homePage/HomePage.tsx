import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, TouchableWithoutFeedback, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import cities from '../../assets/data/cities.json';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppNavigationPropsType } from '../../navigation/AppNavigationPropsType';

const apiKey = "e4802f53135adaf9fe32403d35b6a3ed";
const apiBase = "http://127.0.0.1:8000";
const productApiBase = "https://fakestoreapi.com";

// Her kutu için ana kategori ve alt kategori eşlemesi
const outfitBoxes = [
  { key: 'tshirt', label: 'Tişört', category: 'ust_giyim', subcategory: 'Tişört' },
  { key: 'gomlek', label: 'Gömlek', category: 'ust_giyim', subcategory: 'Gömlek' },
  { key: 'sweat', label: 'Sweat', category: 'ust_giyim', subcategory: 'Sweat' },
  { key: 'mont', label: 'Mont', category: 'ust_giyim', subcategory: 'Mont' },
  { key: 'sort', label: 'Şort', category: 'alt_giyim', subcategory: 'Şort' },
  { key: 'pantolon', label: 'Pantolon', category: 'alt_giyim', subcategory: 'Pantolon' },
  { key: 'spor_ayakkabi', label: 'Spor Ayakkabı', category: 'ayakkabi', subcategory: 'Spor Ayakkabı' },
  { key: 'bot', label: 'Bot', category: 'ayakkabi', subcategory: 'Bot' },
  { key: 'sapka', label: 'Şapka', category: 'aksesuar', subcategory: 'Şapka' },
  { key: 'bere', label: 'Bere', category: 'aksesuar', subcategory: 'Bere' },
  { key: 'atki', label: 'Atkı', category: 'aksesuar', subcategory: 'Atkı' },
  { key: 'eldiven', label: 'Eldiven', category: 'aksesuar', subcategory: 'Eldiven' },
  { key: 'kravat', label: 'Kravat', category: 'aksesuar', subcategory: 'Kravat' },
  { key: 'gozluk', label: 'Gözlük', category: 'aksesuar', subcategory: 'Gözlük' },
  { key: 'saat', label: 'Saat', category: 'aksesuar', subcategory: 'Saat' },
];

const placeholderImg = require('../../assets/images/placeholder.png');

// Web API'deki kategorilere eşleme
const boxToApiCategory: { [key: string]: string } = {
  tshirt: 'men\'s clothing',
  gomlek: 'men\'s clothing',
  sweat: 'men\'s clothing',
  mont: 'men\'s clothing',
  sort: 'men\'s clothing',
  pantolon: 'men\'s clothing',
  spor_ayakkabi: 'men\'s clothing',
  bot: 'men\'s clothing',
  sapka: 'jewelery', // aksesuarlar için farklı kategori
  bere: 'jewelery',
  atki: 'jewelery',
  eldiven: 'jewelery',
  kravat: 'jewelery',
  gozluk: 'jewelery',
  saat: 'jewelery',
};

const HomePage = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppNavigationPropsType>>();
  const [selectedCity, setSelectedCity] = useState<any>(cities[0]);
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [boxImages, setBoxImages] = useState<{ [key: string]: { image: string, title: string } }>({});
  const [imgLoading, setImgLoading] = useState(false);

  // Hava durumuna göre renk şeması
  const getColorScheme = (temp: number) => {
    if (temp >= 25) {
      return {
        background: '#FFF9C4', // Sıcak hava - Açık sarı
        card: '#FFE082', // Sıcak hava - Turuncu-sarı
        text: '#FF6F00', // Sıcak hava - Koyu turuncu
        accent: '#FFB300', // Sıcak hava - Altın sarısı
        upperClothing: '#FFECB3', // Sıcak hava - Açık sarı
        lowerClothing: '#FFE0B2', // Sıcak hava - Açık turuncu
        footwear: '#FFCC80', // Sıcak hava - Turuncu
        accessory: '#FFE57F', // Sıcak hava - Sarı
      };
    } else if (temp >= 15) {
      return {
        background: '#E3F2FD', // Ilıman hava - Açık mavi
        card: '#BBDEFB', // Ilıman hava - Mavi
        text: '#1976D2', // Ilıman hava - Koyu mavi
        accent: '#2196F3', // Ilıman hava - Mavi
        upperClothing: '#B3E5FC', // Ilıman hava - Açık mavi
        lowerClothing: '#81D4FA', // Ilıman hava - Mavi
        footwear: '#4FC3F7', // Ilıman hava - Mavi
        accessory: '#29B6F6', // Ilıman hava - Mavi
      };
    } else {
      return {
        background: '#E8F5E9', // Soğuk hava - Açık yeşil
        card: '#C8E6C9', // Soğuk hava - Yeşil
        text: '#2E7D32', // Soğuk hava - Koyu yeşil
        accent: '#43A047', // Soğuk hava - Yeşil
        upperClothing: '#A5D6A7', // Soğuk hava - Açık yeşil
        lowerClothing: '#81C784', // Soğuk hava - Yeşil
        footwear: '#66BB6A', // Soğuk hava - Yeşil
        accessory: '#4CAF50', // Soğuk hava - Yeşil
      };
    }
  };

  const colorScheme = weather ? getColorScheme(weather.main.temp) : getColorScheme(20);

  const fetchWeather = async () => {
    if (!selectedCity) return;
    setLoading(true);
    setError('');
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${selectedCity.lat}&lon=${selectedCity.lon}&appid=${apiKey}&units=metric&lang=tr`;
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        setWeather(data);
      } else {
        setError(`Hava durumu bilgisi alınamadı. Hata: ${data.message || 'Bilinmeyen hata'}`);
      }
    } catch (err) {
      setError('Bağlantı hatası: Lütfen internet bağlantınızı kontrol edin');
    } finally {
      setLoading(false);
    }
  };

  // Her kutu için web API'den ürün çek
  const fetchBoxImages = async () => {
    setImgLoading(true);
    const newImages: { [key: string]: { image: string, title: string } } = {};
    await Promise.all(
      outfitBoxes.map(async (box) => {
        try {
          const apiCategory = boxToApiCategory[box.key] || 'men\'s clothing';
          const res = await fetch(`${productApiBase}/products/category/${encodeURIComponent(apiCategory)}`);
          if (!res.ok) return;
          const products = await res.json();
          if (products && products.length > 0) {
            const randomProduct = products[Math.floor(Math.random() * products.length)];
            newImages[box.key] = { image: randomProduct.image, title: randomProduct.title };
          }
        } catch {}
      })
    );
    setBoxImages(newImages);
    setImgLoading(false);
  };

  useEffect(() => {
    if (selectedCity) {
      fetchWeather();
    }
    fetchBoxImages();
  }, [selectedCity]);

  return (
    <View style={[styles.page, { backgroundColor: colorScheme.background }]}>
      <View style={[styles.card, { backgroundColor: colorScheme.card }]}>
        {/* Şehir ve Hava Durumu Başlığı */}
        <View style={styles.weatherHeader}>
          <TouchableOpacity onPress={() => setShowPicker(true)}>
            <Text style={[styles.city, { color: colorScheme.text }]}>{selectedCity?.name}</Text>
          </TouchableOpacity>
          {weather && (
            <Text style={[styles.temperature, { color: colorScheme.text }]}>
              {Math.round(weather.main.temp)}°C{' '}
              <Text style={[styles.weatherDesc, { color: colorScheme.text }]}>
                {weather.weather[0].description}
              </Text>
            </Text>
          )}
        </View>

        {/* Şehir Seçici Modal */}
        <Modal
          visible={showPicker}
          transparent={true}
          animationType="slide"
        >
          <TouchableWithoutFeedback onPress={() => setShowPicker(false)}>
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: colorScheme.card }]}>
                <View style={styles.pickerHeader}>
                  <Text style={[styles.pickerTitle, { color: colorScheme.text }]}>Şehir Seçin</Text>
                  <TouchableOpacity onPress={() => setShowPicker(false)}>
                    <Text style={[styles.closeButton, { color: colorScheme.text }]}>Kapat</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedCity?.name}
                    onValueChange={(itemValue: string) => {
                      const city = cities.find((c) => c.name === itemValue);
                      setSelectedCity(city);
                      setShowPicker(false);
                    }}
                    style={[styles.pickerStyle, { color: colorScheme.text }]}
                  >
                    {cities.map((city) => (
                      <Picker.Item key={city.name} label={city.name} value={city.name} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {loading && <ActivityIndicator size="large" color={colorScheme.accent} style={styles.loader} />}
        {error && <Text style={[styles.error, { color: colorScheme.text }]}>{error}</Text>}

        {/* Profil Butonu */}
        <TouchableOpacity 
          style={[styles.profileButton, { backgroundColor: colorScheme.accent }]}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.profileButtonText}>Profilim</Text>
        </TouchableOpacity>

        {/* Chat Butonu */}
        <TouchableOpacity 
          style={[styles.chatButton, { backgroundColor: colorScheme.accent }]}
          onPress={() => navigation.navigate('Chat')}
        >
          <Text style={styles.chatButtonText}>AI Moda Danışmanı ile Konuş</Text>
        </TouchableOpacity>

        {/* Kombin Önerisi Bölümü */}
        <View style={styles.outfitSection}>
          <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>Bugünkü Kombin Önerin</Text>
          {imgLoading ? (
            <ActivityIndicator size="large" color={colorScheme.accent} style={styles.loader} />
          ) : (
            <View style={styles.outfitContainer}>
              {/* Üst Giyim */}
              <View style={styles.outfitCategory}>
                <Text style={[styles.categoryTitle, { color: colorScheme.text }]}>Üst Giyim</Text>
                <View style={styles.categoryItems}>
                  {outfitBoxes.filter(b => b.category === 'ust_giyim').map(box => (
                    <View key={box.key} style={styles.outfitItem}>
                      <Image
                        source={boxImages[box.key]?.image ? { uri: boxImages[box.key].image } : placeholderImg}
                        style={styles.placeholderImage}
                        defaultSource={placeholderImg}
                      />
                      <Text style={[styles.outfitLabel, { color: colorScheme.text }]} numberOfLines={1}>
                        {boxImages[box.key]?.title || box.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
              {/* Alt Giyim */}
              <View style={styles.outfitCategory}>
                <Text style={[styles.categoryTitle, { color: colorScheme.text }]}>Alt Giyim</Text>
                <View style={styles.categoryItems}>
                  {outfitBoxes.filter(b => b.category === 'alt_giyim').map(box => (
                    <View key={box.key} style={styles.outfitItem}>
                      <Image
                        source={boxImages[box.key]?.image ? { uri: boxImages[box.key].image } : placeholderImg}
                        style={styles.placeholderImage}
                        defaultSource={placeholderImg}
                      />
                      <Text style={[styles.outfitLabel, { color: colorScheme.text }]} numberOfLines={1}>
                        {boxImages[box.key]?.title || box.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
              {/* Ayakkabı */}
              <View style={styles.outfitCategory}>
                <Text style={[styles.categoryTitle, { color: colorScheme.text }]}>Ayakkabı</Text>
                <View style={styles.categoryItems}>
                  {outfitBoxes.filter(b => b.category === 'ayakkabi').map(box => (
                    <View key={box.key} style={styles.outfitItem}>
                      <Image
                        source={boxImages[box.key]?.image ? { uri: boxImages[box.key].image } : placeholderImg}
                        style={styles.placeholderImage}
                        defaultSource={placeholderImg}
                      />
                      <Text style={[styles.outfitLabel, { color: colorScheme.text }]} numberOfLines={1}>
                        {boxImages[box.key]?.title || box.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
              {/* Aksesuarlar */}
              <View style={styles.outfitCategory}>
                <Text style={[styles.categoryTitle, { color: colorScheme.text }]}>Aksesuarlar</Text>
                <View style={styles.categoryItems}>
                  {outfitBoxes.filter(b => b.category === 'aksesuar').map(box => (
                    <View key={box.key} style={styles.outfitItem}>
                      <Image
                        source={boxImages[box.key]?.image ? { uri: boxImages[box.key].image } : placeholderImg}
                        style={[styles.placeholderImage, styles.accessory]}
                        defaultSource={placeholderImg}
                      />
                      <Text style={[styles.outfitLabel, { color: colorScheme.text }]} numberOfLines={1}>
                        {boxImages[box.key]?.title || box.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}
          <TouchableOpacity style={[styles.button, { backgroundColor: colorScheme.accent }]} onPress={fetchBoxImages}>
            <Text style={styles.buttonText}>Başka Kombin Öner</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  weatherHeader: {
    marginBottom: 20,
  },
  city: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  temperature: {
    fontSize: 24,
    fontWeight: '600',
  },
  weatherDesc: {
    fontSize: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 16,
    padding: 5,
  },
  pickerContainer: {
    height: 200,
  },
  pickerStyle: {
    height: 200,
  },
  loader: {
    marginVertical: 20,
  },
  error: {
    textAlign: 'center',
    marginVertical: 10,
  },
  outfitSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  outfitContainer: {
    marginBottom: 20,
  },
  outfitCategory: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    paddingLeft: 4,
  },
  categoryItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 12,
  },
  outfitItem: {
    alignItems: 'center',
    width: '30%',
    marginBottom: 16,
  },
  placeholderImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accessory: {
    width: 60,
    height: 60,
  },
  outfitLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  chatButton: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileButton: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  profileButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomePage;