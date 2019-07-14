if (process.env.NODE_ENV !== 'production') dotenv = require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
const http = require('http').Server(app);
const io = require('socket.io')(http).sockets;
const cookieParser = require('cookie-parser')();
const session = require('express-session');
const mongoose = require('mongoose');

const api = require('./routes/api');

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

app.use(morgan('dev'));

const main = express(),
    vhost = require('vhost');

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

main.use('/api/v1', api);
main.use('/', (req, res, next) => {

    console.log(req);

    res.send('messpresso')
})

// handle domain and static files in development
// because heroku doesn't support subdomain
const static = express();
static.use('/', express.static('assets', { maxAge: process.env.COOKIE_MAXAGE }));
static.use('/file', express.static('uploads', { maxAge: process.env.COOKIE_MAXAGE }));

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

app.use(vhost('static.messpresso.com', static));
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