const lang = require('../public/lang/lang');

module.exports = Validation;

function Validation() {

	this.error = {};
	this.language = 'en';
	let self = this;

	this.allowedFile = function(filename) {

		const disallowed = ['rar', 'zip', 'exe', 'php', 'js', 'htm', 'html', 'bat', 'vbs'],
		ext = /\.(\w+)$/i;
		return (filename.match(ext) !== null) && (disallowed.indexOf(filename.match(ext)[1].toLowerCase()) < 0);
	};

	this.isEmail = function(email) {

		const regexEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

		if ( !regexEmail.test(email) ) {

			this.error.email = lang.print('error.invalid email', self.language);
			return false;
		}
		return true;
	};

	this.isEmpty = function(o, type) {

		if ( o === null || (Array.isArray(o) && o.length === 0) || (typeof o === 'string' && o.trim() === '') || (typeof o === 'object' && Object.keys(o).length === 0) ) {

			this.error[type] = lang.print(`error.empty ${type}`, self.language);
			return true;
		}
		return false;
	};

	this.pwdTooShort = function(pwd) {

		if (pwd === null || pwd.length < 6) {
			this.error.password = lang.print('error.invalid password', self.language);
			return true;
		}
		return false;
	};

	this.samePwd = function(pwd1, pwd2) {

		if (pwd1 !== pwd2) {
			this.error.password = lang.print('error.not same password', self.language);
			return false;
		}
		return true;
	}

	this.xssClean = function(val) {

		const regexSanitize = /[><\n]/g;

		return val.trim().replace(regexSanitize, char => ({
			"<": '&lt;',
			">": '&gt;',
			"\n": '<br>'
		})[char]);
	};

	return this;
}