const lang = require('../public/lang/lang'),
Validation = require('./Validation')(),
crypto = require('crypto'),
nodemailer = require('nodemailer'),
ObjectId = require('mongodb').ObjectID;

module.exports = User;

function User(db) {

	let user = db.collection('user'), self = this, userReset = {};

	this.whoIsOnline = function(io, socket, users, currentUid = null) {

		let i, online = [];

		if (currentUid === null) {

			i = users.findIndex(user => user.socketId === socket.id);
			if (i >= 0) users.splice(i, 1);

			for (let user of users)
				online.push(user.uid);

			io.emit('offline', online);
		}
		else {
			i = users.findIndex(user => user.uid === currentUid);

			if (i < 0) {

				let newConnection = {
					uid: currentUid,
					socketId: socket.id
				};
				users.push(newConnection);
			}
			else users[i].socketId = socket.id;

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

				req.data = { error: { token: lang.print('error.session expired') } };
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

		res.render('reset', {
			title: lang.print('reset.title'),
			phEmail: lang.print('register.phEmail'),
			phPassword: lang.print('reset.phPassword'),
			phPasswordConfirm: lang.print('reset.phPasswordConfirm'),
			guideline: lang.print(guideline),
			submitText: lang.print(submitText),
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

			res.render('register', {
				title: lang.print('register.title'),
				phEmail: lang.print('register.phEmail'),
				phUsername: lang.print('register.phUsername'),
				phPassword: lang.print('login.phPassword'),
				submitText: lang.print('register.submitText'),
				loginText: lang.print('register.loginText'),
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

			res.render('login', {
				title: lang.print('login.title'),
				phEmail: lang.print('register.phEmail'),
				phPassword: lang.print('login.phPassword'),
				forgotText: lang.print('login.forgotText'),
				registerText: lang.print('login.registerText'),
				submitText: lang.print('login.submitText'),
				email: (req.data !== undefined) ? req.data.email : null,
				error: (req.data !== undefined) ? req.data.error : null,
			});
		})
		.catch(err => console.error(err));
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
					error: { email: lang.print('error.unexistedUser') }
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
					text: `You are receiving this because you have requested the reset of the password for your account.\nPlease click on the following link, or paste this into your browser to complete the process:\n						http://${ req.headers.host + '/reset?token=' + userReset.resetToken }\nIf you did not request this, please ignore this email and your password will remain unchanged.`
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