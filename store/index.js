import {legacy_createStore as createStore, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers';
import App from '../App';

const store = createStore(rootReducer, applyMiddleware(thunk));

const AppwithRedux = () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
};

export default AppwithRedux;
