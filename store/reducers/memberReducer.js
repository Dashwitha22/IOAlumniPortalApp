import {SET_MEMBERS} from '../actions/memberActions';

const initialState = {
  members: [],
};

const memberReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_MEMBERS:
      return {
        ...state,
        members: action.payload,
      };
    default:
      return state;
  }
};

export default memberReducer;
