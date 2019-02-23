process.env.NODE_ENV = 'production';
if (process.env.NODE_ENV !== 'production') dotenv = require('dotenv').config();
const express = require('express'),
app = express(),
http = require('http').Server(app),
io = require('socket.io')(http).sockets,
bodyParser = require('body-parser'),
cookieParser = require('cookie-parser')(),
MongoClient = require('mongodb').MongoClient,
User = require('./api/User'),
Dialog = require('./api/Dialog');

const client = new MongoClient(process.env.DB_URL, { useNewUrlParser: true }),
urlencodedParser = bodyParser.urlencoded({ extended: false }),
jsonParser = bodyParser.json();

app.use('/asset', express.static('public'));
app.use('/file', express.static('upload'));
app.set('view engine', 'pug');

client.connect((err) => {
	if (err) console.error(err);

	const db = client.db('eightplus'),
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
	
	io.on('connection', (socket) => {

		socket.on('join', (room) => {
			socket.join(room, () => {
				console.log(`in room ${room}`);
			});
		});

		dialog.transfer(io, socket);

		socket.on('disconnect', (data) => {
			console.log(`${socket.id} disconnected`);
		});
	});

	app.use( (req, res) => res.render('404') );
});

http.listen(process.env.PORT);