import { FETCH_USERS } from '../actionTypes';
import { removeError, setError } from './error';
import ajax from '../../helpers/ajax';
import { API_VERSION } from '../../constants';

export function fetchUsers(part = 0, query = '') {

  return (dispatch) => {

    return new Promise((resolve) => {

      ajax({
          url: `/api/${API_VERSION}/user`,
          data: { q: query, part }
        })
        .then(xhr => {

          const res = JSON.parse(xhr.response);

          if (!res.ok) dispatch(setError(res.error));
          else {
            resolve({ users: res.users, end: res.end });
            dispatch(removeError());
          }
        })
        .catch(console.error);
    });
  }
}