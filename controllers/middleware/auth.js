const Token = require('../api/token');

module.exports = (req, res, next) => {
// console.log(req.url, req.baseUrl, req.method);
	Token
		.isValid(req.headers.authorization.split(' ')[1])
		.then(payload => {

			if (!payload) {

				const e = new Error('Invalid token');
				e.status = 401;
				throw e;
			}
			req.body.tokenPayload = payload;
			next();
		})
		.catch(next);

	// try {
	// 	const payload = jwt.verify(, process.env.JWT_SECRET);
	// 	req.payload = payload;
	// 	next();
	// }
	// catch(err) {
	// 	console.error(err);
	// 	res.status(401).json({
	// 		ok: false,
	// 		message: 'Unauthorized'
	// 	});
	// }
};

