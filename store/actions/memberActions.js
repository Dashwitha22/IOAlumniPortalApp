import axios from 'axios';
import {userApiServer} from '../../config';

// Action Types
export const SET_MEMBERS = 'SET_MEMBERS';

// Action Creators
export const setMembers = members => {
  return {
    type: SET_MEMBERS,
    payload: members,
  };
};

export const fetchMembers = () => {
  return async dispatch => {
    try {
      const response = await axios.get(`${userApiServer}/alumni/all`);
      // console.log('Members data', response.data);
      dispatch(setMembers(response.data));
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };
};
