window.addEventListener('load', function() {

  const modals = document.getElementsByClassName('modal');
  for (let i = modals.length; --i >= 0;)
    modals[i].style.setProperty('display', 'flex');
});

function toggleModal(modalId) {

  document.querySelector('html').classList.toggle('is-clipped');
  document.getElementById(modalId).classList.toggle('is-active');
}

export default function(e) {

  const dataModal = e.target.closest('[data-modal]') || e.target.closest('.modal-background') || e.target.closest('.modal .delete');

  if (dataModal !== null) {

    const modalId = dataModal.hasAttribute('data-modal') ? dataModal.getAttribute('data-modal') : dataModal.closest('.modal').id;
    toggleModal(modalId);
  }

  // const modalId = (dataModal.length === undefined) ? dataModal.getAttribute('data-modal') : dataModal[0].getAttribute('data-modal');
  // const modalBg = document.getElementById(modalId).querySelector('.modal-background');
  // const modalClose = document.getElementById(modalId).querySelector('.delete');

  // if (dataModal.length !== undefined)
  //   for (let i = dataModal.length; --i >= 0;)
  //     dataModal[i].addEventListener('click', () => { toggleModal(modalId) }, false);
  // else dataModal.addEventListener('click', () => { toggleModal(modalId) }, false);

  // modalBg.addEventListener('click', () => { toggleModal(modalId) }, false);
  // modalClose.addEventListener('click', () => { toggleModal(modalId) }, false);
}