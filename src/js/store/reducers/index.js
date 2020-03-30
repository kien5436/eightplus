import { combineReducers } from 'redux';

import auth from './auth';
import error from './error';
import metaData from './metadata';

export default combineReducers({
  auth,
  error,
  metaData,
});