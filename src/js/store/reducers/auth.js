import { decode } from 'jsonwebtoken';

import { SET_CURRENT_USER } from '../actionTypes';
import { getCookie } from '../../helpers/cookie';

const markLoggedInToken = decode(getCookie('ml_token'));
const DEFAULT_STATE = {
  isAuthenticated: !!markLoggedInToken && markLoggedInToken.isAuthenticated,
  uid: markLoggedInToken && markLoggedInToken.uid
};

export default function(state = DEFAULT_STATE, action) {

  switch (action.type) {
    case SET_CURRENT_USER:
      return {
        isAuthenticated: action.user.isAuthenticated,
          uid: action.user.uid
      };
    default:
      return state;
  }
}