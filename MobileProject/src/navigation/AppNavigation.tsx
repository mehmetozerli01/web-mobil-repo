import { View, Text } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { AppNavigationPropsType } from './AppNavigationPropsType'
import { NavigationContainer } from '@react-navigation/native';
import HomePage from '../screens/homePage/HomePage';
import ProfilePage from '../screens/profilePage/ProfilePage';
import WelcomePage from '../screens/welcomePage/WelcomePage';
import SignupPage from '../screens/signupPage/SignupPage';
import useAuth from '../hooks/useAuth';


const Stack = createNativeStackNavigator<AppNavigationPropsType>();



const AppNavigation: React.FC = () => {
  const {user}=useAuth();
  if(user) {
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName='Home'>
          
          
          <Stack.Screen name='Home' component={HomePage} />
          
  
        </Stack.Navigator>
  
      </NavigationContainer>
    )
  }
  else{
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName='Welcome'>
          <Stack.Screen name='Welcome' component={WelcomePage} />
          <Stack.Screen name='Signup' component={SignupPage} />
          
          <Stack.Screen name='Profile' component={ProfilePage} />
  
        </Stack.Navigator>
  
      </NavigationContainer>
    ) 

  }
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Welcome'>
        <Stack.Screen name='Welcome' component={WelcomePage} />
        <Stack.Screen name='Signup' component={SignupPage} />
        <Stack.Screen name='Home' component={HomePage} />
        <Stack.Screen name='Profile' component={ProfilePage} />

      </Stack.Navigator>

    </NavigationContainer>
  )

}

export default AppNavigation