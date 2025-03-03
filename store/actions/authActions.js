import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {userApiServer} from '../../config';
import {fetchMembers} from './memberActions';
import {CommonActions} from '@react-navigation/native';

export const loginSuccess = user => {
  return {
    type: 'LOGIN_SUCCESS',
    payload: user,
  };
};

export const loginFailure = error => {
  return {
    type: 'LOGIN_FAILURE',
    payload: error,
  };
};

export const updateProfile = updatedUser => {
  return {
    type: 'UPDATE_PROFILE',
    payload: updatedUser,
  };
};

export const logout = navigation => {
  return async dispatch => {
    try {
      //Retrieve token from AsyncStorage
      const token = await AsyncStorage.getItem('token');
      // Retrieve 'rememberDevice' from AsyncStorage
      const rememberDevice = await AsyncStorage.getItem('rememberDevice');

      if (rememberDevice !== 'true') {
        // If 'Remember Me' was NOT checked, remove email and password
        await AsyncStorage.multiRemove(['email', 'password']);
      }

      // Clear token and user session data regardless of 'Remember Me'
      await AsyncStorage.multiRemove(['user', 'token']);

      // Dispatch logout action to update Redux state
      dispatch({
        type: 'LOGOUT',
      });

      // Reset navigation stack to go back to login page
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{name: 'Login'}],
        }),
      );

      // Navigate the user back to the Login screen
      // navigation.navigate('Login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
};

export const login = (credentials, navigation) => {
  // Perform the login logic here, such as making an API request
  return async dispatch => {
    try {
      const headers = {
        Accept: 'application/json',
        'content-Type': 'application/json',
      };

      const requestBodyString = JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      });

      // Simulating an API request
      const response = await axios.post(
        `${userApiServer}/alumni/login/mobile`,
        requestBodyString,
        {headers},
      );

      const user = response.data.alumni;
      const token = response.data.token;

      // Store user, token in AsyncStorage
      await AsyncStorage.multiSet([
        ['user', JSON.stringify({user})],
        ['token', token],
      ]);

      dispatch(loginSuccess({user, token}));
      console.log('Success message', response.data.message);
      console.log('Login token', token);

      // Fetch members after successful login
      // dispatch(fetchMembers()); // Dispatch the fetchMembers action

      // Reset navigation to remove the login page from the stack
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{name: 'Dashboard'}],
        }),
      );

      // navigation.navigate('Dashboard');
    } catch (error) {
      dispatch(loginFailure(error.response.data));
    }
  };
};

export const clearError = () => {
  return {
    type: 'CLEAR_ERROR',
  };
};
