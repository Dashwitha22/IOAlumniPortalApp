import {
  ARCHIVE_POST_SUCCESS,
  ARCHIVE_POST_FAILURE,
} from '../actions/postActions';

const initialState = {
  posts: [],
  error: null,
};

export const postReducer = (state = initialState, action) => {
  switch (action.type) {
    case ARCHIVE_POST_SUCCESS:
      return {
        ...state,
        posts: state.posts.filter(post => post._id !== action.payload),
      };
    case ARCHIVE_POST_FAILURE:
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};
