import debounce from './debounce';

/**
 * Observe an element and load more content when scroll up or down
 * @param {string|object} scroller HTMLElement or selector
 * @param {string} direction 'down', 'up'
 * @param {number} offset the number between 0 and 1 represents the percentage offset before the next load
 * @param {Function} callback function loads data
 */
export default function scrollLoader({
  scroller = window,
  direction = 'down',
  offset = 0,
  callback
} = {}) {
  scroller = typeof scroller === 'object' ? scroller : document.querySelector(scroller);
  if (direction === 'down') offset = 1 - offset;

  switch (scroller) {
    case window:
      windowScroll(direction, offset, callback);
      break;
    default:
      elemScroll(scroller, direction, offset, callback);
      break;
  }
}

function windowScroll(direction, offset, callback) {

  let lastScrollTop = pageYOffset || document.documentElement.scrollTop;

  window.addEventListener('scroll', debounce(_scroll, 350), false);

  function _scroll() {

    const scrollTop = pageYOffset || document.documentElement.scrollTop;
    const st = scrollTop / document.body.scrollHeight;

    switch (direction) {
      case 'down':
        if (scrollTop > lastScrollTop && st + .1 - offset >= 0) {
          callback()
        }
        break;
      case 'up':
        if (scrollTop > lastScrollTop && st + .1 - offset <= 0) {
          callback()
        }
        break;
    }

    lastScrollTop = scrollTop;
  }
}

function elemScroll(scroller, direction, offset, callback) {

  let lastScrollTop = scroller.scrollTop;

  scroller.addEventListener('scroll', debounce(_scroll, 350), false);

  function _scroll() {

    const scrollTop = this.scrollTop / this.scrollHeight;

    switch (direction) {
      case 'down':
        if (this.scrollTop > lastScrollTop && scrollTop + .1 - offset >= 0)
          callback();
        break;
      case 'up':
        if (this.scrollTop < lastScrollTop && scrollTop + .1 - offset <= 0)
          callback();
        break;
    }

    lastScrollTop = this.scrollTop;
  }
}