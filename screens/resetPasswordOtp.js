import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
} from 'react-native';
import {userApiServer} from '../config';
import {useRoute} from '@react-navigation/native';
import {IoColor1} from '../colorCode';

const ResetPasswordOtp = ({navigation}) => {
  const [otpValues, setOtpValues] = useState(['', '', '', '']);
  const [errorMessage, setErrorMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(true); // Modal visibility state
  // const correctOtp = '1234'; // Simulated correct OTP

  const route = useRoute();
  const otpInputRefs = useRef([]);

  useEffect(() => {
    // Hide modal after 5 seconds
    const timer = setTimeout(() => {
      setModalVisible(false);
    }, 5000);

    // Cleanup timer
    return () => clearTimeout(timer);
  }, []);

  console.log('route email:', route.params.email);
  console.log('Otp:', otpValues);

  const handleOtpChange = (index, value) => {
    if (value.length <= 1) {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = value;
      setOtpValues(newOtpValues);

      if (value !== '') {
        // Move to the next input field if available
        if (index < otpInputRefs.current.length - 1) {
          otpInputRefs.current[index + 1].focus();
        }
      }
    }
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = parseInt(otpValues.join(''));
    console.log('enteredOtp', enteredOtp);
    try {
      const response = await fetch(
        `${userApiServer}/alumni/alumni/verify-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: route.params.email, // Get email from route params
            otp: enteredOtp,
          }),
        },
      );

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (responseText === 'OTP verified successfully') {
        console.log('OTP verified successfully');
        // Navigate to ResetPassword page with email
        navigation.navigate('ResetPassword', {email: route.params.email});
      } else {
        // If OTP is invalid or any other error
        setErrorMessage('Incorrect OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setErrorMessage('Incorrect OTP. Please try again.');
    }
  };

  const handleResendCode = async () => {
    try {
      const response = await fetch(
        `${userApiServer}/alumni/alumni/generate-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({email: route.params.email}),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to resend OTP');
      }

      const data = await response.json();
      console.log('OTP resent successfully:', data);
      // Show success alert when OTP is resent
      Alert.alert('Success', 'A new OTP has been sent to your email.');
    } catch (error) {
      console.error('Error resending OTP:', error);
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Modal for showing the "Check Your Inbox" message */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Image
              source={require('../assets/images/colorLogo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.modalHeading}>Check Your Inbox</Text>
            <Text style={styles.modalText}>
              We've sent an otp to {route.params.email}. Please check your inbox
              and the instructions to reset your password.
            </Text>
          </View>
        </View>
      </Modal>

      {/* OTP Form */}
      <View style={styles.box}>
        <Text style={styles.heading}>Enter the 4-digit code</Text>
        <View style={styles.inlineFields}>
          {otpValues.map((value, index) => (
            <View
              style={[
                styles.inlineField,
                index === otpValues.length - 1 && {marginRight: 0},
              ]}
              key={index}>
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={text => handleOtpChange(index, text)}
                keyboardType="numeric"
                maxLength={1}
                ref={ref => (otpInputRefs.current[index] = ref)}
              />
            </View>
          ))}
        </View>

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        <TouchableOpacity style={styles.submitButton} onPress={handleVerifyOtp}>
          <Text style={styles.submitButtonText}>Verify OTP</Text>
        </TouchableOpacity>

        <View style={styles.submit}>
          <Text style={styles.bottomLink}>Did not receive code?</Text>
          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResendCode}>
            <Text style={styles.resendLink}>RESEND CODE</Text>
          </TouchableOpacity>

          {/* Display resend message after the user clicks on "Resend Code" */}
          {/* {resendMessage ? (
            <Text style={styles.resendMessage}>{resendMessage}</Text>
          ) : null} */}
        </View>
      </View>
    </View>
  );
};

export default ResetPasswordOtp;

const styles = StyleSheet.create({
  container: {
    height: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    justifyContent: 'center',
    padding: 25,
    alignItems: 'center',
  },
  heading: {
    color: 'black',
    fontSize: 25,
    fontFamily: 'Lexend-Regular',
    marginBottom: 30,
    textAlign: 'center',
  },
  inlineFields: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  inlineField: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    fontSize: 20,
    color: 'black',
    fontFamily: 'Lexend-Regular',
    textAlign: 'center',
  },
  submit: {
    marginTop: 5,
  },
  bottomLink: {
    color: 'black',
    textAlign: 'center',
    marginTop: 10,
  },
  resendLink: {
    color: '#0066FF',
    fontFamily: 'Lexend-Regular',
    textAlign: 'center',
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: IoColor1,
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Lexend-Regular',
    fontSize: 16,
  },
  error: {
    color: 'red',
    marginTop: 10,
    fontFamily: 'Lexend-Regular',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Transparent background
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxWidth: 350,
    width: '90%',
  },
  modalHeading: {
    fontSize: 22,
    fontFamily: 'Lexend-Regular',
    marginBottom: 10,
    color: 'black',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'Lexend-Regular',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
});
