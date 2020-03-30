const Validator = require('fastest-validator');

const tenYearsAgo = new Date(Date.now() - 3.1556952e11).getFullYear();
const validator = new Validator();
const checkSave = validator.compile({
  dob: {
    integer: true,
    min: Date.now() - new Date(tenYearsAgo, 0, 1).getTime(),
    type: 'number',
    messages: {
      numberMin: 'invalid dob',
      numberInteger: 'invalid dob',
      required: 'empty dob',
    }
  },
  email: {
    type: 'string',
    trim: true,
    messages: {
      required: 'empty email',
    }
  },
  password: {
    min: 6,
    type: 'string',
    messages: {
      required: 'empty password',
      stringMin: 'invalid password'
    }
  },
  name: {
    max: 40,
    min: 1,
    trim: true,
    type: 'string',
    messages: {
      required: 'empty name',
      stringMax: 'invalid length',
      stringMin: 'invalid length',
    }
  },
  sex: {
    default: 'male',
    type: 'enum',
    values: ['male', 'female', 'other'],
    messages: {
      enumValue: 'invalid sex',
      required: 'invalid sex',
    }
  },
});
const checkUpdate = validator.compile({
  aliasId: {
    alphanum: true,
    convert: true,
    max: 40,
    min: 1,
    optional: true,
    trim: true,
    type: 'string',
    messages: {
      stringAlphanum: 'invalid id',
      stringMax: 'invalid length',
      stringMin: 'invalid length',
    }
  },
  dob: {
    integer: true,
    min: Date.now() - new Date(tenYearsAgo, 0, 1).getTime(),
    optional: true,
    type: 'number',
    messages: {
      numberMin: 'invalid dob',
      numberInteger: 'invalid dob',
    }
  },
  email: {
    optional: true,
    trim: true,
    type: 'string',
  },
  password: {
    min: 6,
    optional: true,
    type: 'string',
    messages: {
      stringMin: 'invalid password'
    }
  },
  sex: {
    default: 'male',
    optional: true,
    type: 'enum',
    values: ['male', 'female', 'other'],
    messages: {
      enumValue: 'invalid sex',
      required: 'invalid sex',
    }
  },
  metaData: {
    optional: true,
    type: 'object',
    strict: 'remove',
    props: {
      locale: {
        optional: true,
        type: 'enum',
        values: ['vi', 'en'],
        messages: {
          enumValue: 'invalid value'
        }
      },
      socialAccount: {
        optional: true,
        type: 'any',
      },
      hidden: {
        optional: true,
        type: 'array',
        items: 'string',
      }
    }
  },
  isOnline: {
    optional: true,
    type: 'boolean',
    message: {
      boolean: 'invalid online status'
    }
  },
});
const checkLogin = validator.compile({
  email: {
    empty: false,
    type: 'string',
    trim: true,
    messages: {
      stringEmpty: 'empty email',
    }
  },
  password: {
    empty: false,
    min: 6,
    type: 'string',
    messages: {
      stringEmpty: 'empty password',
      stringMin: 'invalid password'
    }
  },
});

exports.validateOnLogin = (user) => validate(user, 'login');

exports.validateOnSave = (user) => validate(user, 'save');

exports.validateOnUpdate = (user) => validate(user, 'update', { email: false, aliasId: false });

function validate(user, action, markError = { email: false }) {

  const retErrors = {};
  let errors = null;

  switch (action) {
    case 'save':
      errors = checkSave(user);
      break;
    case 'update':
      errors = checkUpdate(user);
      break;
    case 'login':
      errors = checkLogin(user);
      break;
    default:
      break;
  }

  if (Array.isArray(errors)) {

    for (let i = errors.length; --i >= 0;) {

      const error = errors[i];

      if ('email' in markError && 'email' === error.field) markError.email = true;
      if ('aliasId' in markError && 'aliasId' === error.field) markError.aliasId = true;

      error.value = user[error.field];
      delete error.actual;
      delete error.expected;
      delete error.type;
      retErrors[error.field] = error;
    }
  }

  if (!markError.email && 'email' in user && !isEmail(user.email) && !isPhone(user.email)) {

    retErrors.email = {
      field: 'email',
      value: user.email,
      message: 'invalid email',
    };
    markError.email = true;
  }

  return { errors: retErrors, markError };
}

function isEmail(email) {

  const regexMail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

  return regexMail.test(email);
}

function isPhone(phone) {

  const regexPhone = /^(\+[0-9]{1,4}|0)[0-9]{9,10}$/;
  return regexPhone.test(phone);
}