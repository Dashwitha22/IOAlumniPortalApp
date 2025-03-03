import {combineReducers} from 'redux';
import registrationReducer from './registrationReducer';
import authReducer from './authReducer';
import memberReducer from './memberReducer';

// Combine all your reducers using combineReducers
const rootReducer = combineReducers({
  user: registrationReducer,
  auth: authReducer,
  members: memberReducer,
});

export default rootReducer;
