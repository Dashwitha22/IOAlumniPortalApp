import axios from 'axios';
import {userApiServer} from '../../config';

export const ARCHIVE_POST_SUCCESS = 'ARCHIVE_POST_SUCCESS';
export const ARCHIVE_POST_FAILURE = 'ARCHIVE_POST_FAILURE';

export const archivePost = postId => async dispatch => {
  try {
    const url = `${userApiServer}/posts/${postId}/archive`;
    const response = await axios.put(url);

    if (response.status === 200) {
      dispatch({
        type: ARCHIVE_POST_SUCCESS,
        payload: postId,
      });
      console.log('Post archived successfully');
    } else {
      dispatch({
        type: ARCHIVE_POST_FAILURE,
        payload: 'Failed to archive post',
      });
      console.error('Failed to archive post');
    }
  } catch (error) {
    dispatch({
      type: ARCHIVE_POST_FAILURE,
      payload: 'Error occurred while archiving post',
    });
    console.error('Error occurred while archiving post:', error);
  }
};
