import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { style } from './style'
import useAuth from '../../hooks/useAuth'
import { signOut } from 'firebase/auth'
import { auth } from '../../config/firebase'
import { useNavigation } from '@react-navigation/native';

const ProfilePage = () => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate('Welcome');
    } catch (error) {
      console.error('Çıkış yapılırken bir hata oluştu:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <View style={style.container}>
      <View style={style.header}>
        <View style={style.profileImage}>
          <Image
            source={{ uri: user.photoURL || 'https://via.placeholder.com/120' }}
            style={{ width: 120, height: 120, borderRadius: 60 }}
          />
        </View>
        <Text style={style.name}>{user.displayName || 'Kullanıcı'}</Text>
        <Text style={style.email}>{user.email}</Text>
      </View>

      <View style={style.section}>
        <Text style={style.sectionTitle}>Hesap Ayarları</Text>
        <TouchableOpacity style={style.menuItem}>
          <Text style={style.menuItemText}>Profil Bilgilerini Düzenle</Text>
        </TouchableOpacity>
        <TouchableOpacity style={style.menuItem}>
          <Text style={style.menuItemText}>Şifre Değiştir</Text>
        </TouchableOpacity>
        <TouchableOpacity style={style.menuItem}>
          <Text style={style.menuItemText}>Bildirim Ayarları</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={style.logoutButton} onPress={handleLogout}>
        <Text style={style.logoutButtonText}>Çıkış Yap</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[style.logoutButton, {backgroundColor: '#007AFF', marginTop: 10}]} onPress={() => navigation.navigate('Home')}>
        <Text style={style.logoutButtonText}>Ana Sayfaya Git</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfilePage