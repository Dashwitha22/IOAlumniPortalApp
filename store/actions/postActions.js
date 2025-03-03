import axios from 'axios';
import {userApiServer} from '../../config';
import {Alert} from 'react-native';

// Function to post data to the server
export const uploadImage = async (postData, entityType = 'posts') => {
  try {
    console.log('Uploading image to:', `${userApiServer}/posts/create`);
    console.log('Image FormData:', postData);

    const response = await axios.post(
      `${userApiServer}/${entityType}/create`,
      postData,
      {
        headers: {'Content-Type': 'application/json'},
      },
    );
    Alert.alert('Success : ', 'Post Created Successfully');
    // console.log('Image uploaded successfully:', response.data);
  } catch (error) {
    console.error(
      'Error uploading image:',
      error.response ? error.response.data : error.message,
    );
  }
};

export const uploadData = async (
  postData,
  folderName,
  entityType = 'posts',
) => {
  try {
    console.log(
      'Uploading video to:',
      `${userApiServer}/${entityType}/create?folder=${folderName}`,
    );
    console.log('Video FormData:', postData);

    const response = await axios.post(
      `${userApiServer}/${entityType}/create?folder=${folderName}`,
      postData,
      {
        headers: {'Content-Type': 'application/json'},
      },
    );
    Alert.alert('Success : ', 'Post Created Successfully');
    // console.log('Video uploaded successfully:', response.data);
  } catch (error) {
    console.error(
      'Error uploading video:',
      error.response ? error.response.data : error.message,
    );
  }
};

// Function to fetch posts with pagination
export const fetchPosts = async (page, limit, userId, groupID, entityType) => {
  try {
    if (userId) {
      const response = await axios.get(
        `${userApiServer}/posts/userPosts/${userId}?page=${page}&size=${limit}`,
      );
      console.log(
        'USERS POST TYPE :',
        response.data.records.map(post => post.type),
      );
      return response.data;
    } else if (groupID) {
      const response = await axios.get(
        `${userApiServer}/groups/groups/${groupID}?page=${page}&size=${limit}`,
      );
      return response.data;
    } else if (entityType === 'news') {
      const response = await axios.get(
        `${userApiServer}/${entityType}?page=${page}&size=${limit}`,
      );
      return response.data; // Return the data from the API response
    } else {
      const response = await axios.get(
        `${userApiServer}/posts?page=${page}&size=${limit}`,
      );
      console.log(
        'ALL USERS POST TYPE :',
        response.data.records.map(post => post.type),
      );
      return response.data; // Return the data from the API response
    }
  } catch (error) {
    console.error('Error fetching posts:', error);
    return {error}; // Return an error object
  }
};

// Function to delete a post
export const deletePost = async postId => {
  try {
    const response = await axios.delete(`${userApiServer}/posts/${postId}`);
    console.log('Post deleted successfully');
    return response.data;
  } catch (error) {
    console.error(
      'Error deleting post:',
      error.response ? error.response.data : error.message,
    );
    throw error;
  }
};
