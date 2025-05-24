import { View, Text } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { AppNavigationPropsType } from './AppNavigationPropsType'
import { NavigationContainer } from '@react-navigation/native';
import HomePage from '../screens/homePage/HomePage';
import ProfilePage from '../screens/profilePage/ProfilePage';
import SignupPage from '../screens/signupPage/SignupPage';
import useAuth from '../hooks/useAuth';
import WelcomePage from '../screens/welcomePage/welcomePage';
import FavoritePage from '../screens/favoritePage/favoritePage';
import ChatScreen from '../screens/chatScreen/ChatScreen';
import ProductPage from '../screens/productPage/ProductPage';

const Stack = createNativeStackNavigator<AppNavigationPropsType>();

const AppNavigation: React.FC = () => {
  const { user } = useAuth();
  if (user) {
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName='Home'>
          <Stack.Screen name='Profile' component={ProfilePage} options={{ headerShown: false }} />
          <Stack.Screen name='Home' component={HomePage} options={{ headerShown: false }} />
          <Stack.Screen name='Welcome' component={WelcomePage} options={{ headerShown: false }} />
          <Stack.Screen name='Favorite' component={FavoritePage} options={{ headerShown: false }} />
          <Stack.Screen name='Chat' component={ChatScreen} options={{ headerShown: false }} />
          <Stack.Screen name='Product' component={ProductPage} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    )
  }
  else {
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName='Welcome'>
          <Stack.Screen name='Welcome' component={WelcomePage} options={{ headerShown: false }} />
          <Stack.Screen name='Signup' component={SignupPage} options={{ headerShown: false }} />
          <Stack.Screen name='Home' component={HomePage} options={{ headerShown: false }} />
          <Stack.Screen name='Favorite' component={FavoritePage} options={{ headerShown: false }} />
          <Stack.Screen name='Profile' component={ProfilePage} options={{ headerShown: false }} />
          <Stack.Screen name='Chat' component={ChatScreen} options={{ headerShown: false }} />
          <Stack.Screen name='Product' component={ProductPage} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    )
  }
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Welcome'>
        <Stack.Screen name='Welcome' component={WelcomePage} options={{ headerShown: false }} />
        <Stack.Screen name='Signup' component={SignupPage} options={{ headerShown: false }} />
        <Stack.Screen name='Home' component={HomePage} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default AppNavigation