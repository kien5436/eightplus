const router = require('express').Router();
const cookieParser = require('cookie-parser')(process.env.COOKIE_SECRET);

const { register, login, update, list, logout } = require('../../controllers/api/user');
const auth = require('../../controllers/middleware/auth');

const User = require('../../models/user');
const error = require('../../helpers/error')
const { Types } = require('mongoose')

router
  // .get('/:id', User.getInfo)
  .put('/:id', [cookieParser, auth], update)
  //   .delete('/:id', User.delete)
  //   .get('/search', User.search)
  .post('/login', cookieParser, login)
  .post('/register', cookieParser, register)
  .get('/logout', [cookieParser, auth], logout)
  .get('/', [cookieParser, auth], list)
// .get('/', User.list) // ?uid=user_id&step=skip_number

module.exports = router;