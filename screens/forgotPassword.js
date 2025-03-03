import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {userApiServer} from '../config';
import {IoColor1} from '../colorCode';

const ForgotPassword = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false); // Success message state

  // const user = useSelector(state => state.auth.user);
  // const userId = user ? user._id : null; // Add null check here

  console.log('Email:', email);
  // console.log('UserId:', userId);

  const handleSendResetLink = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${userApiServer}/alumni/alumni/generate-otp`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({email}),
        },
      );

      const data = await response.json();
      console.log('Response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      console.log('OTP sent successfully:', data);
      navigation.navigate('ResetPasswordOtp', {email}); // Navigate to OTP page with email
    } catch (error) {
      console.error('Error sending OTP:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to send OTP. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    // Navigate back to login page
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require('../assets/images/colorLogo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {isEmailSent ? (
        <View style={styles.successContainer}>
          <Text style={styles.title}>Check Your Inbox</Text>
          <Text style={styles.subtitle}>
            We've sent a password reset link to{' '}
            <Text style={{fontWeight: 'bold'}}>{email}</Text>. Please check your
            inbox and follow the instructions to reset your password.
          </Text>

          <TouchableOpacity onPress={() => setIsEmailSent(false)}>
            <Text style={styles.resendLink}>Send Email Again</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleBackToLogin}>
            <Text style={styles.backToLoginText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your
            password.
          </Text>

          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={styles.input}
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleSendResetLink}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Send Reset Link</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleBackToLogin}>
            <Text style={styles.backToLoginText}>Back to Login</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F6F8FC',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Lexend-Bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
    paddingHorizontal: 10,
    fontFamily: 'Lexend-Regular',
  },
  label: {
    alignSelf: 'flex-start',
    marginBottom: 5,
    fontFamily: 'Lexend-Regular',
    color: 'black',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    marginBottom: 20,
    color: 'black',
    fontFamily: 'Lexend-Regular',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: IoColor1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Lexend-Bold',
  },
  backToLoginText: {
    color: '#0066FF',
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
  },
  successContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  resendLink: {
    color: '#0066FF',
    fontSize: 16,
    marginVertical: 10,
    fontFamily: 'Lexend-Regular',
  },
});
