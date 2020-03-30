/**
 * @function debounce
 * @param {Function} func debounced function
 * @param {Number} wait time in ms
 * @param {Boolean} immediate do the function immediately
 */
export default function(func, wait, immediate = false) {

  let timeout;

  return function() {

    const context = this,
      args = arguments;
    const callNow = immediate && !timeout;

    function later() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    }

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}