import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import rootReducer from './reducers';
import { getCookie } from '../helpers/cookie';

const DEFAULT_STATE = {
  auth: {
    isAuthenticated: false,
    user: {}
  },
  metaData: {
    darkMode: getCookie('dark_mode') === 'true',
    locale: getCookie('locale') || 'en',
  },
  error: null,
};

export default createStore(
  rootReducer,
  // DEFAULT_STATE,
  compose(
    applyMiddleware(thunk),
    process.env.NODE_ENV !== 'production' && window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  )
);