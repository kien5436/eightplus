import '../../scss/users/chat.scss';
import Rte from './rte';
import debounce from '../general/debounce';

import Plyr from '../../libs/plyr/plyr.min';

Plyr.setup('.player', {
  seekTime: 5,
  volume: .5,
});

window.addEventListener('load', function(e) {

  document.getElementById('menuOptions').style.setProperty('height', `${window.innerHeight - document.querySelector('.hero-head').clientHeight}px`);

  const messageSocket = io('/message');
  console.info(messageSocket)

  //==== handle mega input
  const richInput = document.getElementById('richInput');
  const attachment = document.getElementById('attachment');
  const emojiPalette = document.getElementById('emojiPalette');
  const sendMessage = document.getElementById('sendMessage');
  const rte = new Rte({
    contentEditable: richInput,
    emojiPalette: emojiPalette,
    fileBtn: attachment,
    submitBtn: sendMessage,
    socket: messageSocket,
  });
  rte.init();
  //==== end handle mega input

  messageSocket.on('receive_message', (data) => {

    console.info(data)
  })

  document.addEventListener('click', function(e) {

    if (null !== e.target.closest('.menu-label')) {

      const menuLabel = e.target.closest('.menu-label');
      const arrow = menuLabel.querySelector('.icon-angle-down');
      const menuList = menuLabel.nextElementSibling;

      arrow.classList.toggle('is-collapse');
      menuList.classList.toggle('is-collapse');

      if (menuList.classList.contains('is-collapse'))
        menuList.style.setProperty('height', 0);
      else
        menuList.style.setProperty('height', menuList.scrollHeight + 'px');
    }
    else if (null !== e.target.closest('.dropdown-trigger')) {
      e.target.closest('.dropdown-trigger').parentNode.classList.toggle('is-active');
    }
    // else if (null !== e.target.closest('.dropdown-content') && null !== e.target.closest('.icon')) {

    //   const icon = e.target.closest('.icon').outerHTML;
    //   const caret = getCaretPosition(richInput);

    //   richInput.innerHTML = `${richInput.innerText.substring(0, caret.start)} ${icon} ${richInput.innerText.substring(caret.end)}`;
    //   setCaretPosition(richInput);
    //   richInput.focus();
    // }
  }, false);

}, false);