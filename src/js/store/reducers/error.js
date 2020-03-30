import { SET_ERROR, REMOVE_ERROR } from '../actionTypes';

export default function(state = {}, action) {

  switch (action.type) {
    case SET_ERROR:
      return {
        ...state,
        ...action.error
      };
    case REMOVE_ERROR:
      return null;
    default:
      return state;
  }
}