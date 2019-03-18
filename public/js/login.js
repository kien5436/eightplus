window.addEventListener('load', function() {
	let input = document.getElementsByTagName('input');
	for (let i = input.length - 1; i >= 0; i--) {
		if (input[i].nextElementSibling && input[i].nextElementSibling.classList.contains('form-error')) {
			input[i].classList.add('invalid');
		}
	}
});

document.addEventListener('input', function(e) {
	let formError = e.target.nextElementSibling;
	if (formError.classList.contains('form-error')) {
		formError.style.setProperty('display', 'none');
		e.target.classList.remove('invalid');
	}
});