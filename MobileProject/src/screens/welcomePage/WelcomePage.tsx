import { View, Text, Image } from 'react-native'
import React from 'react'
import { style } from './style'

const WelcomePage = () => {
  return (
    <View style={style.imageContainer}>
      <Image source={require('../../assets/images/welcomepage_bg.jpg')} style={style.image}/>

      <View style={style.textContainer}>
        <Text>Kombini Seç</Text>
        <Text>Hava Durumuna Göre Günlük Kombininizi Belirleyin!</Text>
      </View>
    </View>
  )
}

export default WelcomePage