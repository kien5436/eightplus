const fs = require('fs');
const { createServer } = require('https');

function init(app) {

  const server = process.env.NODE_ENV !== 'production' ? createServer({
    key: fs.readFileSync('ssl/messpresso.com.key'),
    cert: fs.readFileSync('ssl/messpresso.com.crt')
  }, app) : createServer(app);
  const io = require('socket.io')(server);
  const messageIO = io.of('/message');
  const notifIO = io.of('/notification');

  messageIO.on('connect', (socket) => { app.set('ioMessage', { messageIO, messageSocket: socket }); });
  notifIO.on('connect', (socket) => { app.set('ioNotif', { notifIO, notifSocket: socket }); });

  return server;
}

module.exports = init;