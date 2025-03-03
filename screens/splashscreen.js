import {StyleSheet, Text, View, Image, Animated} from 'react-native';
import React, {useEffect} from 'react';

const Splashscreen = ({navigation}) => {
  const opacity = new Animated.Value(1);

  useEffect(() => {
    const animation = Animated.timing(opacity, {
      toValue: 0,
      duration: 3000, // Adjust the duration as needed
      useNativeDriver: true,
    });

    const timer = setTimeout(() => {
      navigation.navigate('Login');
    }, 3500);

    // Start the animation
    animation.start();

    // Clear the timer and stop the animation when the component is unmounted
    return () => {
      clearTimeout(timer);
      animation.stop();
    };
  }, [opacity]);

  return (
    <View style={styles.container}>
      <Animated.View style={{opacity}}>
        <View style={styles.centeredContent}>
          <Image
            source={require('../assets/images/logo-io.png')}
            style={styles.logo}
          />
        </View>
      </Animated.View>
    </View>
  );
};

export default Splashscreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a3a4c',
  },
  centeredContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    marginHorizontal: 20,
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
});
