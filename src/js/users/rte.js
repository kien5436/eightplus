import ajax from '../general/ajax';

export default class Rte {

  constructor({ contentEditable, emojiPalette, fileBtn, submitBtn, socket = null }) {

    this.contentEditable = contentEditable;
    this.emojiPalette = emojiPalette;
    this.fileBtn = fileBtn;
    this.submitBtn = submitBtn;
    this.socket = socket;
  }

  init() {

    this.contentEditable.focus();

    // this.contentEditable.addEventListener('input', Rte.formatContent, false);
    this.contentEditable.addEventListener('keydown', Rte.handleKeyDown, false);
    this.contentEditable.addEventListener('keyup', Rte.handleKeyUp, false);
    this.contentEditable.addEventListener('mouseup', trackCaret, false);

    this.emojiPalette.addEventListener('click', e => Rte.insertEmoji(e, this.contentEditable), false);
  }

  static formatContent(e) {}

  static handleKeyDown(e) {

    document.execCommand('defaultParagraphSeparator', false, 'div');

    switch (e.keyCode) {

      // case 8: // backspace
      // case 46: // delete
      //   // trackCaret(e);
      //   break;

      // case 37: // left arrow
      // case 38: // up arrow
      // case 39: // right arrow
      // case 40: // down arrow
      //   // trackCaret(e);
      //   break;

      case 13:
        // trackCaret(e);
        // Rte.formatContent(e);

        // if (!e.shiftKey) {
        //   // send contents
        //   console.info('send message')
        // }
        break;
    }
  }

  static handleKeyUp(e) {

    trackCaret(e);

    switch (e.keyCode) {
      case 13:
        if (!e.shiftKey) {

          ajax({
            url: '/api/v1/message',
            method: 'post',
            data: JSON.stringify({ message: 'hello server' }),
            headers: ['content-type: application/json']
          });
        }
        break;
    }
  }

  static insertEmoji(e, contentEditable) {

    let emoji = '';

    if (e.target.classList.contains('fa')) {
      emoji = e.target.innerText;
    }
    else if (e.target.classList.contains('icon')) {
      emoji = e.target.querySelector('.fa').innerText;
    }

    if ('' !== emoji) {

      const offsetKey = +contentEditable.getAttribute('data-offset-key');

      contentEditable.innerHTML = contentEditable.innerText.substring(0, offsetKey) + emoji + contentEditable.innerText.substring(offsetKey);
      // contentEditable.innerHTML = contentEditable.innerText.replace(/([🙂😀😄😆😅😂🤣😊☺️😌😉😏😍😘😗🤑😎🤓🤤😋😜😝😛😈😇🙃😳🤗😚😙😒🙁☹️😞😔😖😓😢😢😭😟😣😩😫😕😱😰😨😧😲😯😑😐🤐😶😡😠😤🙄🤔😪😴😬🤥👻💀👽💩🤧🤒😷🤕😵🤢👿♥️💔🐱🐶🐰🐭🐹🦊🐻🐼🐨🐯🦁🐮🐗🐷🐺🐏🦄🦌🐤🐧])/gum, `<span class="icon is-medium is-size-4"><i class="fa">$1</i></span>`);
      contentEditable.setAttribute('data-offset-key', offsetKey + emoji.length);
    }
  }
}

function trackCaret(e) {

  const selection = window.getSelection();

  if (!selection || 0 === selection.rangeCount) { e.target.setAttribute('data-offset-key', 0); return; }

  const { endContainer, endOffset } = selection.getRangeAt(0);
  const countBeforeEnd = countUntilEndContainer(e.target, endContainer);

  if (countBeforeEnd.error) e.target.setAttribute('data-offset-key', 0);
  else e.target.setAttribute('data-offset-key', countBeforeEnd.count + endOffset);
}

function countUntilEndContainer(parent, endNode, countingState = { count: 0 }) {

  if (parent.hasChildNodes())
    for (const node of parent.childNodes) {

      if (countingState.done) break;

      if (node === endNode) {
        countingState.done = true;
        return countingState;
      }

      if (node.nodeType === Node.TEXT_NODE) {
        countingState.count += node.length;
      }
      else if (node.nodeType === Node.ELEMENT_NODE) {
        countUntilEndContainer(node, endNode, countingState);
      }
      else {
        countingState.error = true;
      }
    }

  return countingState;
}