import { SET_DARK_MODE, SET_LOCALE } from '../actionTypes';

const DEFAULT_STATE = {
  darkMode: false,
  locale: 'en'
};

export default function(state = DEFAULT_STATE, action) {

  switch (action.type) {
    case SET_DARK_MODE:
      return {
        ...state,
        darkMode: action.metaData.darkMode
      };
    case SET_LOCALE:
      return {
        ...state,
        locale: action.metaData.locale
      };
    default:
      return state;
  }
}