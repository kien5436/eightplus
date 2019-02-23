const en = require('./en.json'),
vi = require('./vi.json');

module.exports = {

	en: en,
	vi: vi,

	print(key, lang = 'en') {
		if (key.trim() === '') return undefined;

		key = key.trim().split('.');
		let msg = this[lang];

		for (let i = 0; i < key.length; ++i) {
			if ( !msg.hasOwnProperty(key[i]) ) throw new Error(`'${ key[i] }' is undefined`);
			msg = msg[key[i]];
		}

		return msg;
	}
};