import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const apiBase = 'http://127.0.0.1:8000'; // kendi API adresin
const categories = ['upperwear', 'bottomwear', 'footwear', 'accessories'];

const FavoritePage = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('favorites').then(data => {
      if (data) setFavorites(JSON.parse(data));
      setLoading(false);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favorilerim</Text>
      {loading ? (
        <Text>Yükleniyor...</Text>
      ) : favorites.length === 0 ? (
        <Text>Henüz favori eklemediniz.</Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={item => item.id}
          numColumns={2}
          renderItem={({ item }) => (
            <View style={styles.imageCard}>
              <Image source={{ uri: item.imagePath }} style={styles.image} />
              <Text style={styles.label}>{item.name}</Text>
              <Text style={styles.sub}>{item.category} / {item.subcategory}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  imageCard: { flex: 1, alignItems: 'center', margin: 8, backgroundColor: '#f8f8f8', borderRadius: 10, padding: 8 },
  image: { width: 120, height: 120, borderRadius: 10 },
  label: { marginTop: 8, fontWeight: '600' },
  sub: { fontSize: 12, color: '#888' }
});

export default FavoritePage;