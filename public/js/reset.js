window.addEventListener('load', function() {

	let input = document.getElementsByTagName('input');
	for (let i = input.length - 1; i >= 0; i--) {
		if (input[i].nextElementSibling && input[i].nextElementSibling.classList.contains('form-error')) {
			input[i].classList.add('invalid');
		}
	}

	let validation = new Validation();

	fetch(`/asset/lang/${ getCookie('lang') }.json`)
	.then(res => res.json())
	.then(trans => {

		validation.trans = trans;

		document.querySelector('.form').addEventListener('submit', function(e) {

			e.preventDefault();

			let email = this.email && this.email.value,
			password = this.newPassword && this.newPassword.value,
			pwdConfirmation = this.passwordConfirmation && this.passwordConfirmation.value;

			if (this.email && validation.isEmpty(email))
				return validation.setError('empty email', this.email);
			else if (this.email && !validation.isEmail(email))
				return validation.setError('invalid email', this.email);
			else if ( this.newPassword && validation.isEmpty(password) )
				return validation.setError('empty password', this.newPassword);
			else if ( this.newPassword && validation.pwdTooShort(password) )
				return validation.setError('invalid password', this.newPassword);
			else if ( this.passwordConfirmation && !validation.samePwd(password, pwdConfirmation) )
				return validation.setError('not same password', this.passwordConfirmation);

			this.submit();
		});
	})
	.catch(err => console.error(err));
});

document.addEventListener('input', function(e) {

	let formError = e.target.nextElementSibling;
	if (formError.classList.contains('form-error')) {
		formError.style.setProperty('display', 'none');
		e.target.classList.remove('invalid');
	}
});

function getCookie(cname) {
	let name = cname + '=',
	ca = decodeURIComponent(document.cookie).split(';');
	for(let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return '';
}