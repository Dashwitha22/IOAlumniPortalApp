import axios from 'axios';
import {userApiServer} from '../../config';

export const registerUser = (userData, navigation) => async dispatch => {
  console.log(userData, 'usrr');
  try {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    const response = await axios.post(
      `${userApiServer}/alumni/register/mobile`,
      userData,
      {headers},
    );

    console.log('User added successfully');
    // Navigate to a different screen after successful registration
    navigation.navigate('Login');
  } catch (error) {
    console.log('user not added', error);
  }
};

export const clearError = () => {
  return {
    type: 'CLEAR_ERROR',
  };
};
