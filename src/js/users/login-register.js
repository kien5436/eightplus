import '../general/favicon';
import '../../scss/users/login-register.scss';
import i18n from '../../../helpers/i18n/client';
import Validation from '../general/validation';
import ajax from '../general/ajax';
import { getCookie } from '../general/cookie';

import '../../libs/particles.js/particles';
import '../../libs/datepickerx/DatePickerX.min';

const API_VERSION = 'v1';
const validation = new Validation();

window.addEventListener('load', () => {

  particlesJS('particles', {
    'particles': {
      'number': {
        'value': 40,
        'density': {
          'enable': true,
          'value_area': 800
        }
      },
      'color': {
        'value': '#fff'
      },
      'shape': {
        'type': 'circle',
        'stroke': {
          'width': 0,
          'color': '#000'
        },
        'polygon': {
          'nb_sides': 5
        }
      },
      'size': {
        'value': 5,
        'random': true,
        'anim': {
          'enable': false,
          'speed': 1000,
          'size_min': 0.1,
          'sync': false
        }
      },
      'line_linked': {
        'enable': true,
        'distance': 150,
        'color': '#ffffff',
        'opacity': 0.4,
        'width': 1
      },
      'move': {
        'enable': true,
        'speed': 3,
        'direction': 'none',
        'random': false,
        'straight': false,
        'out_mode': 'out',
        'attract': {
          'enable': false,
          'rotateX': 600,
          'rotateY': 1200
        }
      }
    },
    'interactivity': {
      'detect_on': 'canvas',
      'events': {
        'onhover': {
          'enable': true,
          'mode': 'grab'
        },
        'resize': true
      },
      'modes': {
        'grab': {
          'distance': 200
        }
      }
    },
    'retina_detect': true
  });

  const locale = getCookie('locale') || 'en';
  const datePicker = document.getElementById('datePicker');
  const strictAge = new Date(Date.now()).getFullYear() - 10;

  validation.errors = i18n(locale, 'error');

  if (null !== datePicker) {

    datePicker.DatePickerX.init({
      maxDate: new Date('12/31/' + strictAge),
      minDate: new Date('1/1/' + (strictAge - 200)),
      weekDayLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      todayButton: false,
      format: lang === 'en' ? 'mm/dd/yyyy' : 'dd/mm/yyyy'
    });
    datePicker.addEventListener('change', removeError, false);
  }

  const form = document.querySelector('form');
  form.addEventListener('submit', submitForm, false);

  document.addEventListener('input', removeError, false);
}, false);

function submitForm(e) {

  e.preventDefault();

  const name = this.querySelector('[name=name]');
  const email = this.querySelector('[name=email]');
  const password = this.querySelector('[name=password]');
  const dob = this.querySelector('[name=dob]');
  const sex = this.querySelectorAll('[name=sex]');
  const fields = { name, email, password, dob, sex };
  const sexes = ['male', 'female', 'other'];
  const data = {};

  if (/register\/?$/.test(window.location.pathname)) {

    if (validation.isEmpty(name.value))
      return validation.setError('empty name', name);

    if (validation.isValidDate(dob.DatePickerX.getValue(true)))
      return validation.setError('invalid dob', dob);
    else {
      let isvalidSex = true;

      for (let i = sex.length; --i >= 0;)
        if (sex[i].checked) {
          isvalidSex = sexes.includes(sex[i].value);
          sex.value = sex[i].value;
        }

      if (!isvalidSex) return false;
    }

    data.name = name.value;
    data.dob = dob.DatePickerX.getValue(true);
    data.sex = sex.value;
  }

  if (validation.isEmpty(email.value))
    return validation.setError('empty email', email);
  else if (!validation.isEmailOrPhone(email.value))
    return validation.setError('invalid email', email);

  if (validation.isEmpty(password.value))
    return validation.setError('empty password', password);
  else if (validation.pwdTooShort(password.value))
    return validation.setError('invalid password', password);

  data.email = email.value;
  data.password = password.value;

  ajax({
      url: window.location.pathname,
      method: 'post',
      headers: ['content-type: application/json'],
      data: JSON.stringify(data)
    })
    .then(xhr => {

      const res = JSON.parse(xhr.response);

      if (!res.ok)
        for (const err of res.error) validation.setError(err.message, fields[err.field]);
      else window.location = res.next;
    })
    .catch(console.error);
}

function removeError(e) {

  const formError = e.target.closest('.control').nextElementSibling;

  if (formError && formError.classList.contains('form-error')) {
    formError.classList.remove('form-error');
    formError.classList.add('is-hidden');
    e.target.classList.remove('invalid');
  }
}