import '../../scss/users/contacts.scss';

import modal from '../general/modal';

// const dropdown = document.getElementsByClassName('dropdown');
// for (let i = dropdown.length; --i >= 0;) {
//   dropdown[i].addEventListener('click', function() {

//     const currentDropdown = document.querySelector('.dropdown.is-active');
//     currentDropdown !== null && currentDropdown !== this && currentDropdown.classList.remove('is-active');
//     this.classList.toggle('is-active');
//   }, false);
// }

document.addEventListener('click', function(e) {

  const target = e.target.closest('[data-event]');

  dropdown(e);
  modal(e);
}, false);

function dropdown(e) {

  const target = e.target.closest('.dropdown');
  const currentDropdown = document.querySelector('.dropdown.is-active');
  const dropdownMenu = document.getElementById('dropdownMenu').querySelector('.dropdown-menu').cloneNode(true);

  if (target !== null) {

    if (currentDropdown !== null && currentDropdown !== target) {

      currentDropdown.classList.remove('is-active');
      currentDropdown.removeChild(currentDropdown.querySelector('.dropdown-menu'));
    }
    target.classList.toggle('is-active');
    null === target.querySelector('.dropdown-menu') && target.appendChild(dropdownMenu);
  }
  else if (currentDropdown !== null) {

    currentDropdown.classList.remove('is-active');
    currentDropdown.removeChild(currentDropdown.querySelector('.dropdown-menu'));
  }
}