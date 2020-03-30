if (process.env.NODE_ENV !== 'production') require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
// const session = require('express-session');
const { connect, set } = require('mongoose');

const server = require('./controllers/socket')(app);
const routes = require('./routes');

connect(process.env.DB_URL, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
  })
  .catch(console.error);
set('debug', process.env.DB_DEBUG);

if (process.env.NODE_ENV !== 'production') {

  const webpackDevMiddleware = require('webpack-dev-middleware');

  const config = require('./webpack/config.dev');
  const compiler = require('webpack')(config);

  app.use(webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath,
    clientLogLevel: 'silent',
    serverSideRender: true,
    stats: 'normal',
    writeToDisk: false
  }));
}

app.set('view engine', 'pug');
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// app.use(session({
//   secret: process.env.SS_SECRET,
//   resave: false,
//   saveUninitialized: true,
//   cookie: {
//     secure: process.env.COOKIE_SECURE,
//     maxAge: parseInt(process.env.SS_MAXAGE)
//   }
// }));

app.use('/assets', express.static('assets', { maxAge: process.env.COOKIE_MAXAGE }));
app.use('/files', express.static('uploads', { maxAge: process.env.COOKIE_MAXAGE }));
app.use('/', routes);

server.listen(process.env.PORT || 80, console.log(`server is running at ${process.env.HOST}:${process.env.PORT} (${process.env.NODE_ENV})`));