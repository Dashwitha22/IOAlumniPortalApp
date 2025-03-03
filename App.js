import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import MyStack from './navigation/myStack';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import GlobalFont from 'react-native-global-font';

const App = () => {
  useEffect(() => {
    let fontName = 'Lexend-Regular'; // Exact name of your custom font
    GlobalFont.applyGlobal(fontName);
    console.log('Applied Global Font:', fontName); // Log for confirmation
  }, []);

  return (
    <NavigationContainer>
      <MyStack />
      <Toast />
    </NavigationContainer>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
