import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {userApiServer} from '../config';
import {useRoute} from '@react-navigation/native';
import {IoColor1} from '../colorCode';

const ResetPassword = ({navigation}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const route = useRoute();

  const handleResetPassword = async () => {
    if (password === confirmPassword) {
      try {
        const response = await fetch(
          `${userApiServer}/alumni/alumni/reset-password`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              newPassword: password,
              confirmNewPassword: confirmPassword,
              email: route.params.email, // Get userId from route params
            }),
          },
        );

        if (!response.ok) {
          throw new Error('Failed to reset password');
        }

        const data = await response.json();
        console.log('Password reset successfully:', data);

        // alert('Password reset successfully!');
        navigation.navigate('Login'); // Navigate back to login page
      } catch (error) {
        console.error('Error resetting password:', error);
        alert('Failed to reset password. Please try again.');
      }
    } else {
      alert('Passwords do not match!');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formBox}>
        <Text style={styles.heading}>Reset Your Password</Text>
        <Text style={styles.emailText}>{route.params.email}</Text>

        <TextInput
          style={styles.input}
          placeholder="New Password"
          placeholderTextColor="gray"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="gray"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleResetPassword}>
          <Text style={styles.submitButtonText}>Reset Password</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ResetPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F8FC',
    paddingHorizontal: 20,
  },
  formBox: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
  },
  heading: {
    fontSize: 22,
    fontFamily: 'Lexend-Regular',
    color: '#333',
    marginBottom: 10,
  },
  emailText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    fontFamily: 'Lexend-Regular',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
    color: 'black',
    fontFamily: 'Lexend-Regular',
  },
  submitButton: {
    width: '100%',
    backgroundColor: IoColor1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Lexend-Bold',
  },
});
