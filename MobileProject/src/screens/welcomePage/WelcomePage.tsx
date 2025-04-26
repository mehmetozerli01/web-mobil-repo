import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { style } from './style'
import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../config/firebase'
import { useNavigation } from '@react-navigation/native'

const WelcomePage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigation = useNavigation<any>();

  const handleLogin = async () => {
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate('Home');
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
      <Text style={style.title}>Giriş Yap</Text>
      <TextInput
        style={style.input}
        placeholder='Email'
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={style.input}
        placeholder='Şifre'
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error ? <Text style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>{error}</Text> : null}
      <TouchableOpacity style={style.button} onPress={handleLogin}>
        <Text style={style.buttonText}>Giriş Yap</Text>
      </TouchableOpacity>
      <Text style={style.forgotPassword}>Şifrenizi mi unuttunuz?</Text>
    </View>
  )
}

export default WelcomePage