import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { style } from './style';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useNavigation } from '@react-navigation/native';

const SignupPage = () => {
  const navigation = useNavigation<any>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccess('Hesabınız başarıyla oluşturuldu!');
      navigation.navigate('Profile');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Bir hata oluştu');
      }
    }
  };

  return (
    <View style={style.container}>
      <Text style={style.title}>Kayıt Ol</Text>
      <TextInput
        style={style.input}
        placeholder='Ad Soyad'
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />
      <TextInput
        style={style.input}
        placeholder='Email'
        keyboardType='email-address'
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={style.input}
        placeholder='Şifre'
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={style.input}
        placeholder='Şifreyi Tekrar Girin'
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      {error ? <Text style={style.errorText}>{error}</Text> : null}
      {success ? <Text style={style.successText}>{success}</Text> : null}
      <TouchableOpacity 
        style={style.button}
        onPress={handleSubmit}
      >
        <Text style={style.buttonText}>Kayıt Ol</Text>
      </TouchableOpacity>
      <Text style={style.forgotPassword}>Zaten bir hesabın var mı? Giriş Yap</Text>
    </View>
  );
};

export default SignupPage;