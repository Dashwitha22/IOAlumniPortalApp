const initialState = {
  users: [],
  error: null,
};

const registrationReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_USER_FAILURE':
      return {
        ...state,
        error: action.payload,
      };
    case 'ADD_USER':
      return {
        ...state,
        users: [...state.users, action.payload],
        error: null, // Clear any previous errors
      };
    case 'ADD_USER_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

export default registrationReducer;
