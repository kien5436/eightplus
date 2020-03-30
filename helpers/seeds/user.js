require('dotenv').config();
const enFaker = require('faker/locale/en');
const viFaker = require('faker/locale/vi');
const { connect, connection } = require('mongoose');

const User = require('../../models/user');
const hash = require('../hash');
const alphabetizer = require('../alphabetizer');

connect(process.env.DB_URL, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
  })
  .catch(console.error);

Promise.resolve(create())
  .then(users => User.insertMany(users))
  .then(res => console.log('created ' + res.length + ' users'))
  .catch(console.error)
  .finally(() => {

    connection.close();
    process.exit();
  });

function create() {

  const enUsers = [];
  const viUsers = [];

  for (let i = 50; --i >= 0;) {

    const { password: enpass, salt: ensalt } = hash('123456');
    const { password: vipass, salt: visalt } = hash('123456');
    const enName = enFaker.internet.userName();
    const viName = viFaker.internet.userName();
    const enAva = enName.substring(0, 1).toUpperCase();
    const viAva = alphabetizer(viName.substring(0, 1)).toUpperCase();

    enUsers.push(new User({
      name: enName,
      email: enFaker.internet.email(),
      password: enpass,
      salt: ensalt,
      sex: 'male',
      dob: enFaker.date.between('1980-01-01', '2006-01-01').getTime(),
      avatar: {
        'x32': `/images/avatars/default/_${enAva}x32.png`,
        'x64': `/images/avatars/default/_${enAva}x64.png`,
        'x96': `/images/avatars/default/_${enAva}x96.png`,
        'x128': `/images/avatars/default/_${enAva}x128.png`,
      },
      metaData: {
        'locale': 'en',
        'hidden': ['email', 'phone'],
        'theme': 'light',
      }
    }));

    viUsers.push(new User({
      name: viName,
      email: viFaker.internet.email(),
      password: vipass,
      salt: visalt,
      sex: 'male',
      dob: viFaker.date.between('1980-01-01', '2006-01-01').getTime(),
      avatar: {
        'x32': `/images/avatars/default/_${viAva}x32.png`,
        'x64': `/images/avatars/default/_${viAva}x64.png`,
        'x96': `/images/avatars/default/_${viAva}x96.png`,
        'x128': `/images/avatars/default/_${viAva}x128.png`,
      },
      metaData: {
        'locale': 'vi',
        'hidden': ['email', 'phone'],
        'theme': 'light',
      }
    }));
  }

  return [...enUsers, ...viUsers];
}