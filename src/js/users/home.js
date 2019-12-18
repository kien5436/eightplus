import '../../scss/users/home.scss';

import modal from '../general/modal';

const tabIds = document.querySelectorAll('[data-tab-id]');
const containerIds = document.querySelectorAll('[data-container-id]');

tabIds.forEach(tab => {

  tab.addEventListener('click', function() {

    for (let i = containerIds.length; --i >= 0;) {

      if (containerIds[i].getAttribute('data-container-id') === this.getAttribute('data-tab-id')) {

        containerIds[i].classList.remove('is-hidden');
        this.classList.add('is-active');
        if (document.body.classList.contains('dark')) {

          this.querySelector('a').classList.add('has-text-danger');
          this.querySelector('a').classList.remove('has-text-grey-light');
        }
      }
      else {
        containerIds[i].classList.add('is-hidden');
        tabIds[i].classList.remove('is-active');
        if (document.body.classList.contains('dark')) {

          tabIds[i].querySelector('a').classList.remove('has-text-danger');
          tabIds[i].querySelector('a').classList.add('has-text-grey-light');
        }
      }
    }
  }, false);
});

document.addEventListener('click', modal, false);
// const dataModal = document.querySelectorAll('[data-modal]');
// modal(dataModal);