export default function Validation() {

  this.errors = {};
  let self = this;

  /**
   * @param {string} err error phrase
   * @param {HTMLElement} el input element
   * @param {string} value el's value
   */
  this.setError = function(err, el, value = null) {

    const formError = el.closest('.control').nextElementSibling;

    if (null !== value) el.value = value;

    if (null === formError) {

      formError = document.createElement('p');
      formError.className = 'help is-danger is-hidden form-error';
      el.closest('.control').insertAdjacentElement('afterend', formError);
    }
    else if (!formError.classList.contains('form-error'))
      formError.classList.add('form-error');
    formError.innerText = self.errors[err];
    formError.classList.remove('is-hidden');

    el.classList.add('invalid');
    el.focus();

    return false;
  };

  this.isAlphaNumber = function(str) { return /^[a-z0-9@]+$/i.test(str); };

  this.isValidDate = function(milliseconds) {

    if (!milliseconds) return false;

    const tenYearsAgo = new Date(Date.now() - 3.1556952e11).getFullYear();

    return Date.now() - new Date(tenYearsAgo, 0, 1).getTime() - milliseconds > 0;
  };

  this.allowedFile = function(filename) {

    const disallowed = ['rar', 'zip', 'exe', 'php', 'js', 'htm', 'html', 'bat', 'vbs'],
      ext = /\.(\w+)$/i;
    return (filename.match(ext) !== null) && (disallowed.indexOf(filename.match(ext)[1].toLowerCase()) < 0);
  };

  this.isEmailOrPhone = function(email) {

    const regexEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    const regexPhone = /^(\+[0-9]{1,4}|0)[0-9]{9,10}$/;
    return regexEmail.test(email) || regexPhone.test(email);
  };

  this.isEmpty = function(o) {

    if (o === null || (Array.isArray(o) && o.length === 0) || (typeof o === 'string' && o.trim() === '') || (typeof o === 'object' && Object.keys(o).length === 0)) return true;
    return false;
  };

  this.pwdTooShort = function(pwd) {

    if (pwd === null || pwd.length < 6) return true;
    return false;
  };

  this.samePwd = function(pwd1, pwd2) {

    return pwd1 !== pwd2;
  }

  this.xssClean = function(val) {

    const regexSanitize = /[><\n]/g;

    return val.trim().replace(regexSanitize, char => ({
      "<": '&lt;',
      ">": '&gt;',
      "\n": '<br>'
    })[char]);
  };

  return this;
}