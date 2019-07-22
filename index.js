// process.env.NODE_ENV = 'production';
if (process.env.NODE_ENV !== 'production') dotenv = require('dotenv').config();
const express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http).sockets,
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser')(),
    session = require('express-session'),
    MongoClient = require('mongodb').MongoClient,
    User = require('./api/User'),
    Dialog = require('./api/Dialog');

const client = new MongoClient(process.env.DB_URL, { useNewUrlParser: true }),
    urlencodedParser = bodyParser.urlencoded({ extended: false }),
    jsonParser = bodyParser.json();
let users = [];

app.use(session({
    secret: process.env.SS_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: parseInt(process.env.SS_MAXAGE)
    }
}));
app.use('/asset', express.static('public', { maxAge: process.env.COOKIE_MAXAGE }));
app.use('/file', express.static('upload', { maxAge: process.env.COOKIE_MAXAGE }));
app.set('view engine', 'pug');

client.connect((err) => {

    if (err) return console.error(err);

    const db = client.db('test'),
        user = new User(db),
        dialog = new Dialog(db);

    app.get('/t/:id/', cookieParser, dialog.loadViewDialog);

    app.get('/message/load', dialog.loadMessages);
    app.post('/message/upload', dialog.upload);

    app.get('/register', cookieParser, user.loadViewRegister);
    app.post('/register', [cookieParser, urlencodedParser], user.register, user.loadViewRegister);

    app.get(/\/(login)?$/, cookieParser, user.loadViewLogin);
    app.post('/login', [cookieParser, urlencodedParser], user.login, user.loadViewLogin);

    app.get('/logout', cookieParser, user.logout);

    app.get('/reset', cookieParser, user.loadViewReset);
    app.post('/reset', [cookieParser, urlencodedParser], user.resetPassword, user.loadViewReset);

    app.get('/listUsers', user.listUsers);

    io.on('connection', (socket) => {

        socket.on('join', (data) => {

            socket.join(data.rid);
            users = user.whoIsOnline(io, socket, users, data.uid);
        });

        dialog.transfer(io, socket, users);

        socket.on('disconnect', (data) => { users = user.whoIsOnline(io, socket, users); });
    });

    app.use((req, res) => res.render('404'));
});

http.listen(process.env.PORT);