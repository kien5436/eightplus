/**
 * This is not a file for development purpose
 * It's a temporary workaround to run the app with some subdomains
 */
if (process.env.NODE_ENV !== 'production') dotenv = require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http).sockets;
const logger = require('morgan');
const cookieParser = require('cookie-parser')();
const session = require('express-session');
const mongoose = require('mongoose');

mongoose.connect(process.env.DB_URL, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
});

if (process.env.NODE_ENV !== 'production') {

    const webpackDevMiddleware = require('webpack-dev-middleware');

    const config = require('./webpack/config.dev');
    const compiler = require('webpack')(config);

    app.use(webpackDevMiddleware(compiler, {
        publicPath: config.output.publicPath,
        clientLogLevel: 'silent',
        serverSideRender: true,
        stats: 'errors-only',
        writeToDisk: false
    }));
}

const main = express();

main.use(express.urlencoded({ extended: false }));
main.use(express.json());
main.use(session({
    secret: process.env.SS_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.COOKIE_SECURE,
        maxAge: parseInt(process.env.SS_MAXAGE)
    }
}));
main.set('view engine', 'pug');

const apiRouter = require('./routes/api');
const publicRouter = require('./routes/web/public');

main.use('/api/v1', apiRouter);
main.use('/', publicRouter);

// handle domain and static files in development
// because heroku doesn't support subdomain
const static = express();
static.use('/', express.static('assets', { maxAge: process.env.COOKIE_MAXAGE }));

const staticContent = express();
staticContent.use('/', express.static('uploads', { maxAge: process.env.COOKIE_MAXAGE }));

app.use(logger('dev'));

// CORS: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
app.use((req, res, next) => {

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    // accepted tequests
    if (req.method === 'OPTIONS') {

        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        return res.status(200).json({});
    }
    next();
});

const vhost = require('vhost');
app.use(vhost('static.messpresso.com', static));
app.use(vhost('scontent.messpresso.com', staticContent));
app.use(vhost('messpresso.com', main));

app.use((req, res, next) => {

    const err = new Error('Not found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {

    res.status(err.status || 500).json({
        error: {
            status: err.status,
            message: err.message
        }
    });
});

http.listen(process.env.PORT || 80);