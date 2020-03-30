import { FETCH_USERS } from '../actionTypes'

export default function(state = {}, action) {

  switch (action.type) {
    case FETCH_USERS:
      return {
        ...state,
        users: action.users,
      }
      default:
        return state;
  }
}