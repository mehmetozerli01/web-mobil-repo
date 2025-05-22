import FavoritesPage from '../screens/favorites/FavoritesPage';

<Stack.Navigator>
  {/* ... diğer ekranlar ... */}
  <Stack.Screen name="FavoritesPage" component={FavoritesPage} options={{ headerShown: false }} />
</Stack.Navigator> 