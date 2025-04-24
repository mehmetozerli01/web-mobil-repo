import { View, Text, Image, TextInput, TouchableOpacity } from 'react-native'
import { style } from './style'
import { useState } from 'react'

const WelcomePage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <View style={style.container}>
      <Text style={style.title}>Giriş Yap</Text>
      <TextInput
        style={style.input}
        placeholder='Email'
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={style.input}
        placeholder='Şifre'
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity>
        <Text>Giriş Yap</Text>
      </TouchableOpacity>
      <Text style={style.forgotPassword}>Şifrenizi mi unuttunuz?</Text>



    </View>
  )
}

export default WelcomePage