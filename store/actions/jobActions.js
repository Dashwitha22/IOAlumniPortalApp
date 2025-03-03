import axios from 'axios';
import {userApiServer} from '../../config';
import {readFile} from 'react-native-fs';

const API_URL = `${userApiServer}/jobs/create`;

export const publishJob = async (formData, onSuccess, onError) => {
  // Configure Axios to send a multipart/form-data request
  try {
    console.log('Sending request to API...');

    const response = await axios.post(API_URL, formData, {
      headers: {
        'Content-Type': 'application/json', // Inform backend that it's JSON
      },
    });

    console.log('API RESPONSE : ', response);

    if (response.status === 201) {
      console.log('response 201');
      onSuccess(response.data);
    } else {
      throw new Error('Server responded with an error');
    }
  } catch (error) {
    if (error.response) {
      console.error('Server responded with error:', error.response.data);
      onError(error.response.data);
    } else if (error.request) {
      console.error('No response received from server:', error.request);
      onError('No response was received');
    } else {
      console.error('Error setting up the request:', error.message);
      onError(error.message);
    }
  }
};

// Function to delete a post
export const deleteJob = async jobId => {
  try {
    const response = await axios.delete(`${userApiServer}/jobs/${jobId}`);
    console.log('Job deleted successfully');
    return response.data;
  } catch (error) {
    console.error(
      'Error deleting job:',
      error.response ? error.response.data : error.message,
    );
    throw error;
  }
};
