import '../../scss/users/contacts.scss';
import '../helpers/favicon';
// import ajax from '../helpers/ajax';
// import modal from '../helpers/modal';
// import { getCookie } from '../helpers/cookie';
// import i18n from 'i18n';

import React from 'react';
import { render } from 'react-dom';

// const API_VERSION = 'v1';
// const darkMode = getCookie('dark_mode');
// const locale = getCookie('locale') || 'en';

// window.addEventListener('load', () => {

//   const userList = document.getElementById('user_list');
//   const dict = i18n(locale, 'home');

//   ajax({
//       url: `/api/${API_VERSION}/user`,
//       method: 'get',
//     })
//     .then(xhr => {

//       const res = JSON.parse(xhr.response);

//       render(<LikeButton/>, userList);
//     })
//     .catch(console.error);

// }, false);