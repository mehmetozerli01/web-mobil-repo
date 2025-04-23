import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { style } from './style';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email,setEmail]= useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  return (
    <View style={style.container}>
     <Text style={style.title}>Kayıt Ol</Text>
     <TextInput
        style={style.input}
        placeholder='Ad Soyad'
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={style.input}
        placeholder='Email'
        keyboardType='email-address'
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
      <TextInput
        style={style.input}
        placeholder='Şifreyi Tekrar Girin'
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <TouchableOpacity style={style.button}>
        <Text style={style.buttonText}>Kayıt Ol</Text>
      </TouchableOpacity>
      <Text style={style.forgotPassword}>Zaten bir hesabın var mı? Giriş Yap</Text>

      
      

      

      <Text>SignupPage</Text>
    </View>
  )
}

export default SignupPage