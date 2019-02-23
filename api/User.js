const lang = require('../public/lang/lang'),
Validation = require('./Validation')(),
crypto = require('crypto'),
ObjectId = require('mongodb').ObjectID;

module.exports = User;

function User(db) {

	let user = db.collection('user'), self = this;

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
				placeholderEmail: lang.print('register.placeholderEmail'),
				placeholderUsername: lang.print('register.placeholderUsername'),
				placeholderPassword: lang.print('login.placeholderPassword'),
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
				placeholderEmail: lang.print('register.placeholderEmail'),
				placeholderPassword: lang.print('login.placeholderPassword'),
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

	function hash(pwd, salt = '') {
		if (salt === '') salt = crypto.randomBytes(512).toString('base64');
		return {
			hashed: crypto.pbkdf2Sync(pwd, salt, 100, 64, 'sha512').toString('hex'),
			salt: salt
		};
	}

	return this;
}