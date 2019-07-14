const lang = require('../public/lang/lang'),
Validation = require('./Validation')(),
crypto = require('crypto'),
nodemailer = require('nodemailer'),
ObjectId = require('mongodb').ObjectID;

module.exports = User;

function User(db) {

	let user = db.collection('user'), self = this, userReset = {};

	this.listUsers = function(req, res) {

		user.find().project({ 'username': 1 })
		.toArray((err, result) => {
			
			if (err) {
			
				console.error(err);
				return res.sendStatus(500);
			}
			res.json(result);
		});
	};

	this.whoIsOnline = function(io, socket, users, currentUid = null) {

		let i, online = [];

		if (currentUid === null) {

			for (let j = users.length; --j >= 0;) {
				
				i = users[j].socketId.findIndex(id => id === socket.id);
				if (i >= 0) users[j].socketId.splice(i, 1);
				if (users[j].socketId.length === 0) users.splice(j, 1);
			}

			for (let user of users)
				online.push(user.uid);

			io.emit('offline', online);
		}
		else {
			i = users.findIndex(user => user.uid === currentUid);

			if (i < 0) {

				let newConnection = {
					uid: currentUid,
					socketId: [socket.id]
				};
				users.push(newConnection);
			}
			else users[i].socketId.push(socket.id);

			for (let user of users)
				online.push(user.uid);

			io.emit('online', online);
		}

		return users;
	};

	this.resetPassword = function(req, res, next) {

		if (!req.body) return res.sendStatus(400);

		if (req.body._method === 'PUT') {

			if ( Validation.isEmpty(req.body.newPassword, 'password') || Validation.pwdTooShort(req.body.newPassword) || !Validation.samePwd(req.body.newPassword, req.body.passwordConfirmation) ) {

				req.data = { error: Validation.error };
				return next();
			}
			else if (userReset.resetToken !== req.body.resetToken || req.body.authToken !== req.session.authToken) {

				req.data = { error: { token: lang.print('error.session expired', req.cookies.lang) } };
				return next();
			}

			doReset(req, res);
		}
		else if (req.method === 'POST') {

			let email = req.body.email.trim() || null;

			if ( Validation.isEmpty(email, 'email') || !Validation.isEmail(email) ) {

				req.data = {
					email: email,
					error: Validation.error
				}
				Validation.error = {};
				return next();
			}

			sendResetLink(email, req, next);
		}
	};

	this.loadViewReset = function(req, res) {

		let email, error, type = 'text', submitText = 'reset.submitTextSend', guideline = 'reset.guidelineEnter';

		if (req.session.authToken === undefined) {

			req.session.authToken = crypto.randomBytes(20).toString('base64');
		}

		if (req.data !== undefined) {

			email = req.data.email;
			error = req.data.error;

			if (req.data.sent) {

				type = 'hidden';
				submitText = 'reset.submitTextResend';
				guideline = 'reset.guidelineResend';
			}
		}

		if (Object.keys(req.query).length > 0)
			submitText = 'reset.submitTextReset';

		self.setLocale(req.cookies, res);

		res.render('reset', {
			ua: require('./UA')(req.headers['user-agent']),
			title: lang.print('reset.title', req.cookies.lang),
			phEmail: lang.print('register.phEmail', req.cookies.lang),
			phPassword: lang.print('reset.phPassword', req.cookies.lang),
			phPasswordConfirm: lang.print('reset.phPasswordConfirm', req.cookies.lang),
			guideline: lang.print(guideline, req.cookies.lang),
			submitText: lang.print(submitText, req.cookies.lang),
			email: email,
			type: type,
			error: error,
			resetToken: req.query.token || null,
			authToken: req.session.authToken || null
		});
	};

	this.logout = function(req, res) {
		for (cookie in req.cookies) {
			res.clearCookie(cookie);
		}
		res.redirect('/login');
	};

	this.register = function(req, res, next) {

		if (!req.body) return res.sendStatus(400);

		let email = req.body.email.trim() || null,
		username = req.body.nickname.trim() || null,
		password = req.body.password || null;

		let error = validateRegister(email, username, password);
		
		if (error === null) {

			user.find({ email: email }).count()
			.then(result => {
				
				if (result === 0) {

					const hashedPwd = hash(password);

					user.insertOne({
						email: email,
						username: username,
						pwd: hashedPwd.hashed,
						salt: hashedPwd.salt
					}, (err, result) => {
						if (err) console.error(err);

						res.cookie('uid', result.insertedId, { maxAge: process.env.COOKIE_MAXAGE });
						res.redirect('/t/hall');
					});
				}
				else {
					req.data = {
						email: email,
						username: username,
						error: { email: lang.print('error.existedUser') }
					};
					return next();
				}
			})
			.catch( err => console.error(err) );
		}
		else {
			req.data = {
				email: email,
				username: username,
				error: error
			};
			Validation.error = {};
			return next();
		}
	};

	this.loadViewRegister = function(req, res) {

		self.exists(req, res)
		.then(result => {

			if (result) return res.redirect('/t/hall');

			self.setLocale(req.cookies, res);

			res.render('register', {
				ua: require('./UA')(req.headers['user-agent']),
				title: lang.print('register.title', req.cookies.lang),
				phEmail: lang.print('register.phEmail', req.cookies.lang),
				phUsername: lang.print('register.phUsername', req.cookies.lang),
				phPassword: lang.print('login.phPassword', req.cookies.lang),
				submitText: lang.print('register.submitText', req.cookies.lang),
				loginText: lang.print('register.loginText', req.cookies.lang),
				email: (req.data !== undefined) ? req.data.email : null,
				username: (req.data !== undefined) ? req.data.username : null,
				error: (req.data !== undefined) ? req.data.error : null,
			});
		})
		.catch(err => console.error(err.message));
	};

	this.login = function(req, res, next) {

		if (!req.body) return res.sendStatus(400);
		
		let email = req.body.email.trim() || null,
		password = req.body.password || null;

		let error = validateLogin(email, password);

		if (error === null) {

			user.find({ email: email }).next((err, result) => {
				if (err) console.error(err);

				if (result !== null && hash(password, result.salt).hashed === result.pwd) {
					res.cookie('uid', result._id, { maxAge: process.env.COOKIE_MAXAGE });
					res.redirect('/t/hall');
				}
				else {
					req.data = {
						email: email,
						error: { email: lang.print('error.unexistedUser') }
					};
					return next();
				}
			});
		}
		else {
			req.data = {
				email: email,
				error: error
			};
			Validation.error = {};
			return next();
		}
	};

	this.loadViewLogin = function(req, res) {

		if (req.url === '/') return res.redirect('/login');

		self.exists(req, res)
		.then(result => {

			if (result) return res.redirect('/t/hall');

			self.setLocale(req.cookies, res);

			res.render('login', {
				ua: require('./UA')(req.headers['user-agent']),
				title: lang.print('login.title', req.cookies.lang),
				phEmail: lang.print('register.phEmail', req.cookies.lang),
				phPassword: lang.print('login.phPassword', req.cookies.lang),
				forgotText: lang.print('login.forgotText', req.cookies.lang),
				registerText: lang.print('login.registerText', req.cookies.lang),
				submitText: lang.print('login.submitText', req.cookies.lang),
				email: (req.data !== undefined) ? req.data.email : null,
				error: (req.data !== undefined) ? req.data.error : null,
			});
		})
		.catch(err => console.error(err));
	};

	this.setLocale = function(cookies, res) {

		const locale = ['en', 'vi'];

		if (!cookies.lang || locale.indexOf(cookies.lang) < 0)
			res.cookie('lang', 'en', { maxAge: process.env.COOKIE_MAXAGE });
		Validation.language = cookies.lang;
	};

	this.exists = function(req, res) {
		// return user.find({ _id: new ObjectId(req.cookies.uid) }).count();
		return new Promise((resolve, reject) => {
			user.find({ _id: new ObjectId(req.cookies.uid) })
			.count((err, result) => {
				if (err) reject(err);
				resolve(result !== 0);
			});
		});
	};

	function doReset(req, res) {
		
		const hashedPwd = hash(req.body.newPassword);

		user.updateOne({ email: userReset.email }, {
			$set: {
				pwd: hashedPwd.hashed,
				salt: hashedPwd.salt
			}
		}, (err, result) => {

			if (err) console.error(err);
			req.session.destroy( err => console.error(err) );
			res.redirect('/login');
		});
	}

	function sendResetLink(email, req, next) {

		user.find({ email: email }).count()
		.then(count => {

			if (count === 0) {

				req.data = {
					email: email,
					error: { email: lang.print('error.unexistedUser', req.cookies.lang) }
				};
			}
			else {
				userReset.email = email;
				userReset.resetToken = crypto.randomBytes(10).toString('hex');
				req.data = {
					sent: true,
					email: email
				};

				let transporter = nodemailer.createTransport({
					host: 'smtp.gmail.com',
					service: 'gmail',
					secure: process.env.GMAIL_SECURE,
					auth: {
						type: 'OAuth2',
						scope: 'https://mail.google.com/',
						user: 'kiendp00@gmail.com',
						clientId: process.env.GMAIL_CLIENT_ID,
						clientSecret: process.env.GMAIL_CLIENT_SECRET,
						accessToken: process.env.GMAIL_ACCESS_TOKEN,
						refreshToken: process.env.GMAIL_REFRESH_TOKEN
					}
				});
				const data = {
					from: 'admin@eightplus.herokuapp.com <no-reply@eightplus.herokuapp.com>',
					sender: 'admin@eightplus.herokuapp.com',
					to: email,
					priority: 'high',
					subject: 'Password reset',
					text: `You are receiving this because you have requested the reset of the password for your account.\nPlease click on the following link, or paste this into your browser to complete the process:\nhttp://${ req.headers.host + '/reset?token=' + userReset.resetToken }\nIf you did not request this, please ignore this email and your password will remain unchanged.`
				};

				transporter.sendMail(data, (err) => {
					
					if (err) console.error(err);
				});
			}
			return next();
		})
		.catch( err => console.error(err) );
	}

	function validateLogin(email, password) {
		if (Validation.isEmpty(email, 'email') || !Validation.isEmail(email)
			|| Validation.pwdTooShort(password)) {
			return Validation.error;
		}
		return null;
	}

	function validateRegister(email, username, password) {
		if (Validation.isEmpty(email, 'email') || !Validation.isEmail(email)
			|| Validation.isEmpty(username, 'username')
			|| Validation.pwdTooShort(password)) {
			return Validation.error;
	}
	return null;
	}

	function hash(pwd, salt = crypto.randomBytes(512).toString('base64')) {

		return {
			hashed: crypto.pbkdf2Sync(pwd, salt, 100, 64, 'sha512').toString('hex'),
			salt: salt
		};
	}

	return this;
}