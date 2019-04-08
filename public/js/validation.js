function Validation() {

	this.trans = {};
	let self = this;

	this.setError = function(err, el) {

		let p = el.nextElementSibling;

		if (!p.classList.contains('form-error')) {

			p = document.createElement('p');
			p.className = 'form-error';
		}
		p.innerText = self.trans.error[err];
		p.style.display === 'none' && p.style.setProperty('display', 'block');

		el.classList.add('invalid');
		el.insertAdjacentElement('afterend', p);
		el.focus();
		
		return false;
	};

	this.allowedFile = function(filename) {

		const disallowed = ['rar', 'zip', 'exe', 'php', 'js', 'htm', 'html', 'bat', 'vbs'],
		ext = /\.(\w+)$/i;
		return (filename.match(ext) !== null) && (disallowed.indexOf(filename.match(ext)[1].toLowerCase()) < 0);
	};

	this.isEmail = function(email) {

		const regexEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

		if ( !regexEmail.test(email) ) return false;
		return true;
	};

	this.isEmpty = function(o) {

		if ( o === null || (Array.isArray(o) && o.length === 0) || (typeof o === 'string' && o.trim() === '') || (typeof o === 'object' && Object.keys(o).length === 0) ) return true;
		return false;
	};

	this.pwdTooShort = function(pwd) {

		if (pwd === null || pwd.length < 6) return true;
		return false;
	};

	this.samePwd = function(pwd1, pwd2) {

		if (pwd1 !== pwd2) return false;
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