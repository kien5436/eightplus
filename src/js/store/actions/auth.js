import { decode } from 'jsonwebtoken';

import { SET_CURRENT_USER } from '../actionTypes';
import { setError, removeError } from './error';
import ajax from '../../helpers/ajax';
import { API_VERSION } from '../../constants';

export function logout() {

  return (dispatch) => {

    ajax({ url: `/api/${API_VERSION}/user/logout` })
      .then(xhr => {

        const res = JSON.parse(xhr.response);

        if (res.ok) {

          dispatch(setCurrentUser({
            isAuthenticated: false,
            uid: null
          }));
          dispatch(removeError());
        }
      })
      .catch(console.error);
  }
}

export function authUser(action, data) {

  return (dispatch) => {

    ajax({
        url: `/api/${API_VERSION}/user/${action}`,
        method: 'post',
        data: JSON.stringify(data),
        headers: ['content-type: application/json'],
      })
      .then(xhr => {

        const res = JSON.parse(xhr.response);

        if (!res.ok) dispatch(setError(res.error));
        else {
          const { uid, isAuthenticated } = decode(res.ml_token);

          dispatch(setCurrentUser({ uid, isAuthenticated }));
          dispatch(removeError());
        }
      })
      .catch(console.error);
  }
}

function setCurrentUser(user) { return { type: SET_CURRENT_USER, user }; }