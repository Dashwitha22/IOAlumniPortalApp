import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Modal,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import CheckBox from '@react-native-community/checkbox';
import {connect} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';
import {login} from '../store/actions/authActions';
import {clearError} from '../store/actions/registrationActions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {IoColor1, IoColor2} from '../colorCode';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const windowWidth = Dimensions.get('window').width;
const contentWidth = windowWidth - 40; // Subtracting twice the marginHorizontal
const windowHeight = Dimensions.get('window').height;

const Login = ({navigation, login, error, clearError}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [modalVisible, setModalVisible] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Check if credentials are stored when the component mounts
    retrieveStoredCredentials();
  }, []);

  // Function to retrieve stored credentials from AsyncStorage
  const retrieveStoredCredentials = async () => {
    try {
      const storedEmail = await AsyncStorage.getItem('email');
      const storedPassword = await AsyncStorage.getItem('password');
      const storedRememberMe = await AsyncStorage.getItem('rememberDevice');

      // Only prefill email and password if 'Remember Me' is true
      if (storedRememberMe === 'true') {
        if (storedEmail !== null) setEmail(storedEmail); // Set email if stored
        if (storedPassword !== null) setPassword(storedPassword); // Set password if stored
        setRememberDevice(true); // Ensure checkbox stays checked
      }
    } catch (error) {
      console.error('Failed to load stored credentials:', error);
    }
  };

  // Function to store credentials in AsyncStorage
  const storeCredentials = async () => {
    try {
      if (rememberDevice) {
        await AsyncStorage.setItem('email', email);
        await AsyncStorage.setItem('password', password);
        await AsyncStorage.setItem('rememberDevice', 'true');
      } else {
        await AsyncStorage.removeItem('email');
        await AsyncStorage.removeItem('password');
        await AsyncStorage.setItem('rememberDevice', 'false');
      }
    } catch (error) {
      console.error('Failed to store credentials:', error);
    }
  };

  const handleLogin = () => {
    setIsLoading(true);
    const credentials = {
      email,
      password,
    };
    login(credentials, navigation)
      .then(() => {
        storeCredentials(); // Save credentials to AsyncStorage if "Remember Me" is checked
        setIsLoading(false);
        // Only clear the fields if "Remember Me" is NOT checked
        if (!rememberDevice) {
          setEmail('');
          setPassword('');
        }
      })
      .catch(err => {
        // handle error
        setIsLoading(false);
        console.error('Login failed:', err);
      });
  };

  useFocusEffect(
    React.useCallback(() => {
      setModalVisible(true); // Ensure modal is visible when screen is focused
      return () => {
        clearError(); // Optionally clear errors when the view is blurred
        setModalVisible(false); // And hide the modal
      };
    }, []),
  );

  return (
    <View style={styles.fullScreen}>
      {/* Replace `require` with the path to your local asset or a uri for a network image */}
      <Image
        source={{
          uri: 'https://alumnify.in/static/media/high-school-graduates-graduation-adult-sky.671581c3af254788f40c.jpg',
        }}
        style={styles.welcomeImage}
      />

      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/logo-io.png')}
          style={styles.logo}
        />
      </View>
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeTitle}>REDISCOVER RECONNECT REIGNITE</Text>
        <Text style={styles.welcomeSubtitle}>
          Your Alumni Journey Starts Here!
        </Text>
      </View>
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <ScrollView>
              <Text style={styles.heading1}>Welcome To</Text>
              <Text style={styles.title}>ALUMNIFY</Text>

              {/* <Text style={styles.heading2}>
                Log in to your Alumni Portal Account!
              </Text> */}

              {error && <Text style={styles.error}>{error}</Text>}

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter email"
                  placeholderTextColor="#666"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Password"
                    placeholderTextColor="#666"
                    secureTextEntry={!showPassword} // Toggle based on state
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}>
                    <Icon
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={22}
                      color="gray"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.checkboxContainer}>
                <CheckBox
                  value={rememberDevice}
                  onValueChange={setRememberDevice}
                  style={styles.checkbox}
                  tintColors={{true: 'rgb(23, 72, 115)', false: 'gray'}} // for Android
                />
                <Text style={styles.labelCheckbox}>Remember this device</Text>
              </View>

              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>Login</Text>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account?</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.link}>Register</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const mapStateToProps = state => ({
  error: state.auth.error,
});

const mapDispatchToProps = {
  login,
  clearError,
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: IoColor1,
    fontFamily: 'Lexend-Regular',
  },
  logoContainer: {
    alignItems: 'center',
    margin: 10,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  welcomeContainer: {
    alignItems: 'center',
    borderRadius: 10,
    marginTop: -40,
  },
  welcomeTitle: {
    fontSize: 19,
    textAlign: 'center',
    color: 'white',
    fontFamily: 'Lexend-Bold', // Make sure this matches your font name in the assets folder
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Lexend-Regular',
  },
  welcomeImage: {
    position: 'absolute', // Make the image cover the whole background
    top: 0,
    left: 0,
    width: windowWidth, // Full screen width
    height: windowHeight, // Full screen height
    resizeMode: 'cover', // Cover the entire space
    opacity: 0.5, // Optional: Add opacity for better contrast
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 160,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: windowWidth - 40, // Adjust modal width here
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
    fontFamily: 'Lexend-Bold',
    marginBottom: 15,
    color: IoColor1,
  },
  heading1: {
    fontSize: 25,
    fontFamily: 'Lexend-Bold',
    // fontFamily: 'Lexend-Bold',
    color: IoColor1,
    textAlign: 'center',
    marginTop: 10,
  },
  heading2: {
    color: IoColor1,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    fontFamily: 'Lexend-Regular',
  },
  label: {
    alignSelf: 'flex-start',
    marginBottom: 5,
    color: 'black',
    fontFamily: 'Lexend-Bold',
  },
  input: {
    width: '100%',
    height: 40,
    marginBottom: 15,
    borderWidth: 1,
    padding: 10,
    borderRadius: 4,
    color: 'black',
    borderColor: '#ddd',
    backgroundColor: '#f7f7f7',
  },
  button: {
    width: '100%',
    backgroundColor: IoColor2,
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Lexend-Bold',
    fontFamily: 'Lexend-Regular',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  footerText: {
    fontSize: 14,
    color: 'rgb(0, 128, 128)',
    fontFamily: 'Lexend-Regular',
  },
  link: {
    color: 'blue',
    marginLeft: 5,
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%', // Ensures the container uses full width
  },
  checkbox: {
    marginRight: 8,
  },
  labelCheckbox: {
    fontSize: 16,
    color: 'black',
    fontFamily: 'Lexend-Regular',
  },
  forgotPassword: {
    fontSize: 16,
    color: 'blue', // You can adjust the color as needed
    marginTop: 10,
    fontFamily: 'Lexend-Regular',
  },
  error: {
    color: 'red',
    padding: 10,
    marginBottom: 5,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});
