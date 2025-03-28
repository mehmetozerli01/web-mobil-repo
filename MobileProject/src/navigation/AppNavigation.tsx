import { View, Text } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { AppNavigationPropsType } from './AppNavigationPropsType'
import { NavigationContainer } from '@react-navigation/native';
import HomePage from '../screens/homePage/HomePage';
import ProfilePage from '../screens/profilePage/ProfilePage';


const Stack = createNativeStackNavigator<AppNavigationPropsType>();



const AppNavigation: React.FC = () => {
  return (
    <NavigationContainer>
        <Stack.Navigator initialRouteName='Home'>
            <Stack.Screen name='Home' component={HomePage}/>
            <Stack.Screen name='Profile' component={ProfilePage}/>

        </Stack.Navigator>

    </NavigationContainer>
  )
}

export default AppNavigation