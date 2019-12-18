import '../general/favicon';
import '../../scss/users/profile.scss';
import modal from '../general/modal';
import ajax from '../general/ajax';
import { getCookie } from '../general/cookie';
import debounce from '../general/debounce';
import i18n from '../../../helpers/i18n/client';
import Validation from '../general/validation';

import '../../libs/datepickerx/DatePickerX.min';

const API_VERSION = 'v1';
const uid = getCookie('uid');
const validation = new Validation();

window.addEventListener('load', () => {

  const onlineStatusSwitcher = document.querySelector('[name=online_status]');
  const socialForm = document.getElementById('socialForm');
  const infoForm = document.getElementById('infoForm');
  const dob = document.getElementById('dob');
  const strictAge = new Date(Date.now()).getFullYear() - 10;
  const locale = getCookie('locale') || 'en';

  validation.errors = i18n(locale, 'error');

  if (null !== dob) {

    dob.DatePickerX.init({
      maxDate: new Date('12/31/' + strictAge),
      minDate: new Date('1/1/' + (strictAge - 200)),
      weekDayLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      todayButton: false,
      format: locale === 'en' ? 'mm/dd/yyyy' : 'dd/mm/yyyy',
    });
    dob.DatePickerX.setValue(dob.value);
  }

  onlineStatusSwitcher && onlineStatusSwitcher.addEventListener('click', debounce(changeOnlineStatus, 450), false);

  socialForm.addEventListener('submit', addSocialAccount, false);

  infoForm.addEventListener('submit', updateInfo, false);

  document.addEventListener('click', function(e) {

    if (null !== e.target.closest('.form-toggler')) {

      const formToggler = e.target.closest('.form-toggler');
      const formInfoId = formToggler.getAttribute('data-form-info');
      const formUpdateId = formToggler.getAttribute('data-form-update');
      const targetFormUpdate = document.getElementById(formUpdateId);
      const formUpdate = document.getElementsByClassName('formUpdate');

      for (let i = formUpdate.length; --i >= 0;) {

        if (formUpdate[i] !== targetFormUpdate && !formUpdate[i].classList.contains('is-hidden')) {

          formUpdate[i].classList.add('is-hidden');
          formUpdate[i].previousElementSibling.classList.remove('is-hidden');
        }
      }

      document.getElementById(formInfoId).classList.toggle('is-hidden');
      targetFormUpdate.classList.toggle('is-hidden');
      if (!targetFormUpdate.classList.contains('is-hidden')) {

        if (null !== targetFormUpdate.closest('#infoForm'))
          document.getElementById('actionInfo').classList.remove('is-hidden');

        if (targetFormUpdate.querySelector('.input') !== null)
          targetFormUpdate.querySelector('.input').focus();
      }
      else document.getElementById('actionInfo').classList.add('is-hidden');
    }
  }, false);
}, false);

document.addEventListener('click', modal, false);

function updateInfo(e) {

  e.preventDefault();

  const id = document.getElementById('id');
  const email = document.getElementById('email');
  const phone = document.getElementById('phone');
  const dob = document.getElementById('dob');
  const sex = document.querySelector('[data-id=sex]');
  const password = document.getElementById('password');
  const oldPwd = document.getElementById('oldPwd');
  const hiddenOptions = document.querySelectorAll('[data-id]');
  const actionInfo = document.getElementById('actionInfo');
  const formUpdates = document.getElementsByClassName('formUpdate');
  const data = {};
  const hidden = [];

  if (!validation.isEmpty(id.value)) data.id = id.value;
  if (!validation.isEmpty(email.value)) data.email = email.value;
  if (!validation.isEmpty(phone.value)) data.phone = phone.value;
  if (!validation.isEmpty(dob.DatePickerX.getValue(true))) data.dob = dob.DatePickerX.getValue(true);
  if (!validation.isEmpty(sex.value)) data.sex = sex.value;
  if (!validation.isEmpty(password.value)) data.password = password.value;
  for (let i = hiddenOptions.length; --i >= 0;) {
    if ('true' === hiddenOptions[i].value) hidden.push(hiddenOptions[i].getAttribute('data-id'));
  }
  if (hidden.length > 0) data.metaData = { hidden };
  if (validation.isEmpty(data)) {

    actionInfo.classList.add('is-hidden');
    for (let i = formUpdates.length; --i >= 0;)
      if (!formUpdates[i].classList.contains('is-hidden')) {
        formUpdates[i].classList.add('is-hidden');
        formUpdates[i].previousElementSibling.classList.remove('is-hidden');
      }
    return;
  }

  ajax({
      url: `/api/${API_VERSION}/user/${uid}`,
      method: 'put',
      data: JSON.stringify(data),
      headers: ['content-type: application/json']
    })
    .then((xhr) => {

      console.info(xhr);

      actionInfo.classList.add('is-hidden');
      for (let i = formUpdates.length; --i >= 0;)
        if (!formUpdates[i].classList.contains('is-hidden')) {
          formUpdates[i].classList.add('is-hidden');
          formUpdates[i].previousElementSibling.classList.remove('is-hidden');
        }
    })
    .catch(console.error);

}

function addSocialAccount(e) {

  e.preventDefault();

  let socialAccount = document.getElementById('socialAccount');

  if (null !== socialAccount) socialAccount = socialAccount.value.trim();

  if (/^(ftp|https?):\/\/[^ "]+$/.test(socialAccount)) {

    const domain = socialAccount.match(/:\/\/(\w+\.)?(\w+)\.(\w+)\/.*$/)[2];

    ajax({
        url: `/api/${API_VERSION}/user/${uid}`,
        method: 'put',
        data: JSON.stringify({
          metaData: {
            socialAccount: {
              [domain]: socialAccount
            }
          }
        }),
        headers: ['content-type: application/json']
      })
      .then(xhr => {

        this.querySelector('.formInfo').innerHTML += `<p><span class="icon ${document.body.classList.contains('dark') ? 'has-text-grey-light' : ''}"><i class="icon-${domain}"></i></span><a class="has-text-link" href="${socialAccount}">${socialAccount}</a></p>`;
      })
      .catch(console.error)
      .finally(() => {

        this.querySelector('.formUpdate').classList.toggle('is-hidden');
        this.querySelector('.formInfo').classList.toggle('is-hidden');
      });
  }
  else {
    this.querySelector('.formUpdate').classList.toggle('is-hidden');
    this.querySelector('.formInfo').classList.toggle('is-hidden');
  }
}

function changeOnlineStatus() {

  this.parentElement.classList.toggle('active');

  ajax({
      url: `/api/${API_VERSION}/user/${uid}`,
      method: 'put',
      data: JSON.stringify({ isOnline: this.checked }),
      headers: ['content-type: application/json']
    })
    .catch(console.error);
}