const router = require('express').Router();

const user = require('./user');
const room = require('./room');
const message = require('./message');
const token = require('./token');

router
	.use('/conversation', room)
	.use('/message', message)
	.use('/token', token)
	.use('/user', user)
	.use((req, res, next) => {

		const err = new Error('Not found');
		err.status = 404;
		next(err);
	})
	.use((err, req, res, next) => {

		console.log(err);
		console.table(err);

		if (res.headersSent) return;

		const serverErr = [ 'MongoError'];

		if (serverErr.indexOf(err.name) < 0) {

			res.status(err.status || 500).json({
				ok: false,
				error: {
					message: err.message,
					errors: err.errors,
				}
			});
		}
		else res.status(500).json({
			ok: false,
			error: {
				message: 'Internal server error'
			}
		});
	});

module.exports = router;