const router = require('express').Router();

const error = require('../../helpers/error');
const user = require('./user');
const upload = require('../../controllers/api/upload');
// const room = require('./room');
// const message = require('./message');
// const token = require('./token');

router
  // .use('/conversation', room)
  .use('/message', (req, res, next) => {

    console.log(req.body, req.app.get('ioMessages'));
    const { messageSocket, messageIO } = req.app.get('ioMessage');

    messageSocket.emit('receive_message', 'hello client');

    res.sendStatus(200)
  })
  // .use('/token', token)
  .use('/upload', upload)
  .use('/user', user)
  .use((req, res, next) => { next(error('Not found', { status: 404 })); })
  .use((err, req, res, next) => {
    console.log(err);

    if (res.headersSent) return;

    const serverErr = ['MongoError', 'CastError'];
    let error = {};

    if (err.hasOwnProperty('errors')) {

      error = err.errors;
    }
    else error.message = !serverErr.includes(err.name) ? err.message : 'Internal server error';

    res.status(err.status || 500).json({
      ok: false,
      error
    });
  });

module.exports = router;