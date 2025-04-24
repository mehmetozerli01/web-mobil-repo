import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { style } from '../welcomePage/style';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email,setEmail]= useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async ()=>{
    if (email && password) {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (err) {
    if (err instanceof Error) {
      console.log('Got error:', err.message);
    } else {
      console.log('Unknown error:', err);
    }
  }
}


  }


  return (
    <View style={style.container}>
     <Text style={style.title}>Kayıt Ol</Text>
     <TextInput
        style={style.input}
        placeholder='Ad Soyad'
        value={name}
        onChangeText={value=>setName(value)}
      />
      <TextInput
        style={style.input}
        placeholder='Email'
        keyboardType='email-address'
        value={email}
        onChangeText={value=>setEmail(value)}
      />
      <TextInput
        style={style.input}
        placeholder='Şifre'
        secureTextEntry
        value={password}
        onChangeText={value=>setPassword(value)}
      />
      <TextInput
        style={style.input}
        placeholder='Şifreyi Tekrar Girin'
        secureTextEntry
        value={confirmPassword}
        onChangeText={value=>setConfirmPassword(value)}
      />
      <TouchableOpacity 
      style={style.button}
      onPress={handleSubmit}
      >

        <Text style={style.buttonText}>Kayıt Ol</Text>
      </TouchableOpacity>
      <Text style={style.forgotPassword}>Zaten bir hesabın var mı? Giriş Yap</Text>

      
      

      

      <Text>SignupPage</Text>
    </View>
  )
}

export default SignupPage