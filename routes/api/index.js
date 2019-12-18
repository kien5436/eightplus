const router = require('express').Router();

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
  .use('/user', user);

module.exports = router;