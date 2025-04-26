import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { style } from './style';
import useAuth from '../../hooks/useAuth';
import { Picker } from '@react-native-picker/picker';

const apiKey = "e4802f53135adaf9fe32403d35b6a3ed";

const cities = [
  { "name": "Adana", "lat": 37.0, "lon": 35.3213 },
  { "name": "Adıyaman", "lat": 37.7648, "lon": 38.2786 },
  { "name": "Afyonkarahisar", "lat": 38.7569, "lon": 30.5433 },
  { "name": "Ağrı", "lat": 39.7191, "lon": 43.0503 },
  { "name": "Amasya", "lat": 40.6499, "lon": 35.8353 },
  { "name": "Ankara", "lat": 39.9208, "lon": 32.8541 },
  { "name": "Antalya", "lat": 36.8841, "lon": 30.7056 },
  { "name": "Artvin", "lat": 41.1828, "lon": 41.8183 },
  { "name": "Aydın", "lat": 37.856, "lon": 27.8416 },
  { "name": "Balıkesir", "lat": 39.6484, "lon": 27.8826 },
  { "name": "Bilecik", "lat": 40.0567, "lon": 30.0665 },
  { "name": "Bingöl", "lat": 38.8852, "lon": 40.4983 },
  { "name": "Bitlis", "lat": 38.4015, "lon": 42.1078 },
  { "name": "Bolu", "lat": 40.576, "lon": 31.5788 },
  { "name": "Burdur", "lat": 37.7203, "lon": 30.2908 },
  { "name": "Bursa", "lat": 40.1826, "lon": 29.0669 },
  { "name": "Çanakkale", "lat": 40.1553, "lon": 26.4142 },
  { "name": "Çankırı", "lat": 40.6013, "lon": 33.6134 },
  { "name": "Çorum", "lat": 40.5506, "lon": 34.9556 },
  { "name": "Denizli", "lat": 37.7765, "lon": 29.0864 },
  { "name": "Diyarbakır", "lat": 37.9144, "lon": 40.2306 },
  { "name": "Edirne", "lat": 41.6771, "lon": 26.5557 },
  { "name": "Elazığ", "lat": 38.6749, "lon": 39.2232 },
  { "name": "Erzincan", "lat": 39.7526, "lon": 39.4925 },
  { "name": "Erzurum", "lat": 39.9052, "lon": 41.2659 },
  { "name": "Eskişehir", "lat": 39.7767, "lon": 30.5206 },
  { "name": "Gaziantep", "lat": 37.0662, "lon": 37.3833 },
  { "name": "Giresun", "lat": 40.9175, "lon": 38.3927 },
  { "name": "Gümüşhane", "lat": 40.4386, "lon": 39.5086 },
  { "name": "Hakkari", "lat": 37.5833, "lon": 43.7333 },
  { "name": "Hatay", "lat": 36.4018, "lon": 36.3498 },
  { "name": "Isparta", "lat": 37.7648, "lon": 30.5566 },
  { "name": "İstanbul", "lat": 41.0082, "lon": 28.9784 },
  { "name": "İzmir", "lat": 38.4192, "lon": 27.1287 },
  { "name": "Kars", "lat": 40.601, "lon": 43.0947 }
];

const HomePage = () => {
  const { user } = useAuth();
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async () => {
    if (!selectedCity) {
      setError('Lütfen bir şehir seçin.');
      return;
    }
    setLoading(true);
    setError('');
    setWeather(null);
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${selectedCity.lat}&lon=${selectedCity.lon}&appid=${apiKey}&units=metric&lang=tr`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.cod !== 200) {
        setError('Hava durumu bilgisi alınamadı.');
      } else {
        setWeather(data);
      }
    } catch (err) {
      setError('Hava durumu bilgisi alınamadı.');
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={style.container}>
        <View style={style.header}>
          <Text style={style.headerTitle}>Hoş Geldiniz</Text>
          <Text style={style.headerSubtitle}>{user?.displayName || 'Kullanıcı'}</Text>
        </View>

        <View style={{ marginVertical: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Şehir Seçin</Text>
          <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 10, marginBottom: 10 }}>
            <Picker
              selectedValue={selectedCity ? selectedCity.name : ''}
              onValueChange={(itemValue) => {
                const city = cities.find((c) => c.name === itemValue);
                setSelectedCity(city);
              }}
              style={{ width: '100%' }}
            >
              <Picker.Item label="Şehir seçin..." value="" />
              {cities.map((city) => (
                <Picker.Item key={city.name} label={city.name} value={city.name} />
              ))}
            </Picker>
          </View>
          <TouchableOpacity style={style.button} onPress={fetchWeather}>
            <Text style={style.buttonText}>Hava Durumunu Getir</Text>
          </TouchableOpacity>
          {loading && <ActivityIndicator size="large" color="#007AFF" />}
          {error ? <Text style={{ color: 'red', marginTop: 10 }}>{error}</Text> : null}
          {weather && (
            <View style={{ marginTop: 20, padding: 20, backgroundColor: '#F5F5F5', borderRadius: 10 }}>
              <Text style={{ fontSize: 18 }}>Şehir: {weather.name}</Text>
              <Text style={{ fontSize: 18 }}>Sıcaklık: {weather.main.temp}°C</Text>
              <Text style={{ fontSize: 18 }}>Hissedilen: {weather.main.feels_like}°C</Text>
              <Text style={{ fontSize: 18 }}>Durum: {weather.weather[0].description}</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default HomePage;