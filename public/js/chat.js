window.addEventListener('load', function() {

	let socket = io.connect(),
	btnSend = document.getElementById('btn-send'),
	editor = document.getElementById('editor'),
	iconPalette = document.getElementsByClassName('icons-palette')[0],
	messages = document.getElementById('messages'),
	rid = document.getElementById('rid').value,
	attachment = document.getElementById('attachment'),
	user = document.getElementsByClassName('user'),
	lastMsg = 20, trans;

	loadMessages(rid).then(res => {

		if (res.success && res.content !== null && res.content.length > 0) {
			for (let i = 0, l = res.content.length; i < l; ++i) {
				newMessage(res.content[i], 1);
			}
		}
	})
	.catch(err => console.error(err));

	socket.on('connect', () => socket.emit('join', { rid: rid, uid: getCookie('uid') }));

	socket.on('online', online => localStorage.setItem('active', JSON.stringify(online)));
	socket.on('offline', online => localStorage.setItem('active', JSON.stringify(online)));

	fetch(`/asset/lang/${ getCookie('lang') }.json`)
	.then(res => res.json())
	.then(lang => {
		trans = lang;
		changeOnlineStatus();
	})
	.catch(err => console.error(err));

	setInterval(changeOnlineStatus, 60000);

	editor.addEventListener('keypress', e => {

		if (e.keyCode === 13 && !e.shiftKey) {
			
			e.preventDefault();
			sendMsg(socket);
		}
	});
	btnSend.addEventListener('click', () => sendMsg(socket) );

	socket.on('_typing', data => {

		let typing = 
		`<li class="message" id="typing">
		<div class="message-wrapper"> 
		<div class="dot-wrapper">
		<div class="dot-hint">${ data.username } is typing...</div>
		<div class="dot dot-1"></div><div class="dot dot-2"></div><div class="dot dot-3"></div>
		</div>
		</div>
		</li>`,
		msgTyping = document.getElementById('typing');

		if (data.typing && !msgTyping) {

			messages.innerHTML += typing;
			msgTyping = document.getElementById('typing');
			msgTyping.scrollIntoView({ block: 'end', inline: 'end' });
		}
		else if (!data.typing && msgTyping) msgTyping.remove();
	});

	socket.on('new message', data => newMessage(data) );

	editor.addEventListener('keyup', function() {

		setTimeout(() => {
			socket.emit('typing', {
				uid: getCookie('uid'),
				typing: this.value !== ''
			});
		}, 700);
	});

	messages.addEventListener('scroll', function() {
		if (this.scrollTop === 0 && lastMsg > -1) {
			
			loadMessages(rid, lastMsg)
			.then(res => {
				if (res.success && res.content !== null && res.content.length > 0) {
					for (let i = 0, l = res.content.length; i < l; ++i) {
						newMessage(res.content[i], 1);
					}
					lastMsg += 20;
				}
				else lastMsg = -1;
			})
			.catch(err => console.error(err));
		}
	});

	/* insert emoji */
	iconPalette.addEventListener('click', e => {

		let icon = e.target.getAttribute('data-ic');
		if (icon !== null) {
			let start = editor.selectionStart, end = editor.selectionEnd, txt = editor.value;
			editor.value = txt.substring(0, start) +  `:${ icon }:` + txt.substring(end);
			editor.focus();
			editor.selectionEnd = end + icon.length + 2;
		}
	});

	attachment.addEventListener('change', e => {

		const files = e.target.files;
		let preview = document.getElementsByClassName('preview');

		if (preview.length === 0) {
			preview = document.createElement('div');
			preview.className = 'preview';
			preview.innerHTML = '';
		}
		else preview = preview[0];

		for (let file of files) {

			if (file.type.match('image.*')) {
				preview.innerHTML +=
				`<div class="preview_file preview_file-img">
				<img src="${ (window.URL || window.webkitURL).createObjectURL(file) }">
				<div class="preview_file-close" data-name="${ file.name }"></div>
				</div>`;
			}
			else {
				preview.innerHTML +=
				`<div class="preview_file">
				<i class="fa fa-download fa-white preview_file-icon"></i>
				<div class="preview_file-name">${ file.name }</div>
				<div class="preview_file-close" data-name="${ file.name }"></div>
				</div>`;
			}
			localStorage.setItem(file.name, 'added');
		}
		document.getElementsByClassName('input')[0].appendChild(preview);
	});

	document.getElementById('findUser').addEventListener('keyup', function() {

		setTimeout(() => {

			let words = this.value.trim().toLowerCase().split('');

			fetch('/listUsers').then(res => {

				if (res.ok) return res.json();
				throw new Error('Something went wrong');
			})
			.then(users => {

				let res = users.filter(user => {
					return words.every(char => user.username.toLowerCase().indexOf(char) >= 0) && user;
				});
				let html = '';

				if (words.length > 0 && res.length > 0) {

					for (let user of res)
						html += `<li class="user"><a href="/t/${ user._id }"><span class="user-name">${ user.username }</span><span class="user-status"></span></a></li>`;
				}
				else {
					html = `<li class="user"><a href="/t/hall"><span class="user-name">${ trans.chat.hall }</span><span class="user-status active"></span></a></li>`;

					for (let user of users)
						html += `<li class="user"><a href="/t/${ user._id }"><span class="user-name">${ user.username }</span><span class="user-status"></span></a></li>`;
				}
				
				document.querySelector('.contact_body').innerHTML = html;
				changeOnlineStatus();
			})
			.catch(err => console.error(err));
		}, 700);
	});

	document.addEventListener('click', e => {

		const target = e.target;

		if (target.matches('.preview_file-close')) {
			let filename = target.getAttribute('data-name');
			localStorage.getItem(filename) !== null && localStorage.setItem(filename, 'removed');
			target.parentNode.remove();
		}
		if (target.parentNode.matches('.preview_file-img') && target.closest('#messages')) {
			messages.innerHTML += `<div class="lightbox">
			<div class="lightbox-close preview_file-close"></div>
			<img src="${ target.src }">
			</div>`;
		}
		if ((target.parentNode.matches('.lightbox') || target.matches('.lightbox')) && target.tagName !== 'IMG') {
			document.getElementsByClassName('lightbox')[0].remove();
		}
	});

	function upload() {
		
		return new Promise((resolve, reject) => {

			const xhr = new XMLHttpRequest(),
			data = new FormData();

			for (let file of attachment.files) {
				(localStorage.getItem(file.name) !== 'removed' && localStorage.getItem(file.name) !== null) && data.append('files', file);
				localStorage.removeItem(file.name);
			}

			if (data.getAll('files').length > 0) {

				xhr.addEventListener('load', function() {
					const res = JSON.parse(this.response);
					data.delete('files');
					document.getElementsByClassName('preview')[0].remove();
					if (res.success) resolve(res.info);
					else reject(res.info);
				});
				xhr.upload.addEventListener('progress', function(e) {
					let percent_complete = (e.loaded / e.total) * 100;
					console.log(percent_complete);
				});
				xhr.open('POST', '/message/upload');
				xhr.setRequestHeader('Accept', 'application/json');
				xhr.send(data);
			}
			else resolve(null);
		});
	}

	function sendMsg(socket) {

		upload()
		.then((fileUploaded) => {

			const message = {
				text: editor.value.trim().replace(/\r\n/g, '\n'),
				file: fileUploaded
			};

			if (message.text === '' && message.file === null) {
				
				caughtEmptyMsg(trans.error['empty message']);
				return;
			}

			editor.value = '';

			socket.emit('send message', {

				msg: JSON.stringify(message),
				senderId: getCookie('uid'),
				created: Date.now()
			}, (err) => caughtEmptyMsg(err));
		})
		.catch(err => caughtEmptyMsg(err));

		editor.focus();
	}

	function changeOnlineStatus() {
		
		const onliner = JSON.parse(localStorage.getItem('active')),
		regexCookie = /^j:"(.*)"$/,
		currentChat = location.pathname.match(/t\/(\w+)/)[1];

		if (onliner === null) return;

		let userInfoStatus = document.querySelector('.user_info-status'), online = false;

		if (trans !== undefined) {

			for (let i = user.length; --i > 0;) {

				let id = user[i].firstChild.href, uid, found = false;			

				for (let j = onliner.length; --j >= 0;) {

					uid = onliner[j].match(regexCookie)[1];

					if (uid === currentChat && !online) {

						userInfoStatus.firstChild.classList.add('active');
						userInfoStatus.lastChild.innerText = trans.chat.statusOn;
						online = true;
					}

					if (id.indexOf(uid) > 0) {

						user[i].querySelector('.user-status').classList.add('active');
						found = true;
						break;
					}
				}

				!found && user[i].querySelector('.user-status').classList.remove('active');

				if (!online && currentChat.toLowerCase() !== 'hall') {

					userInfoStatus.firstChild.classList.remove('active');
					userInfoStatus.lastChild.innerText = trans.chat.statusOff;
				}
			}
		}
	};
});

(function() {
	let prefs = {
		lang: 'en',
		bg: 'dark',
	};
	localStorage.getItem('prefs') === null && localStorage.setItem('prefs', JSON.stringify(prefs));
	
	prefs = JSON.parse(localStorage.getItem('prefs'));
	if (prefs.bg === 'light') document.body.classList.add('light');
	else document.body.classList.remove('light');
})();

let menuActivator = new MenuActivator({
	activeClass: 'chatting',
	listItem: document.querySelectorAll('.user a')
}),
actionInfoIcon = document.getElementById('action_info-icon'),
btnEmoji = document.getElementById('btn-emoji'),
setting = document.getElementsByClassName('setting')[0],
settingIcon = document.getElementsByClassName('fa-cog')[0];

menuActivator.activate();

actionInfoIcon.addEventListener('click', () => {
	document.getElementsByClassName('action_info-menu')[0].classList.toggle('hidden');
});

btnEmoji.addEventListener('click', () => {
	document.getElementsByClassName('icons')[0].classList.toggle('hidden');
});

settingIcon.addEventListener('click', () => {
	setting.classList.toggle('hidden');
});

setting.addEventListener('click', e => {

	if ( e.target.classList.contains('changeBg') ) {
		
		document.body.classList.toggle('light');
		let prefs = JSON.parse(localStorage.getItem('prefs'));

		if (prefs !== null)
			prefs.bg = prefs.bg === 'dark' ? 'light' : 'dark';
		else
			prefs = {
				lang: 'en',
				bg: document.body.classList.contains('light') ? 'light' : 'dark'
			};
			localStorage.setItem('prefs', JSON.stringify(prefs));
		}
		else if ( e.target.classList.contains('changeLang') ) {

			setCookie('lang', getCookie('lang') === 'en' ? 'vi' : 'en', 30);
			location.reload();
		}
	});

function loadMessages(rid, lastMsg = 0) {

	return new Promise((resolve, reject) => {

		const xhr = new XMLHttpRequest();
		xhr.addEventListener('load', function() {
			const res = JSON.parse(this.response);
			resolve(res);
		});
		xhr.addEventListener('error', reject);
		xhr.open('GET', `/message/load?rid=${ rid }&step=${ lastMsg }`);
		xhr.setRequestHeader('Accept', 'application/json');
		xhr.send();
	});
}

function newMessage(data, old = 0) {

	const message = document.getElementsByClassName('message');
	let bell = document.getElementById('bell'), newMsg = 
	`<li class="message" data-scroll="${ data.scroll }">
	<div class="message-wrapper${ getCookie('uid').indexOf(data.sender.id) >= 0 ? ' you' : '' }"> 
	<div class="message-content">
	<b class="message-sender">${ data.sender.name }:</b><br/>
	${ txt2Emoji(data.msg.text) }<br/>
	${ showFiles(data.msg.file) }
	</div>
	<p class="message-time">${ data.created.formatTime() }</p>
	</div>
	</li>`;

	if (old === 0) {
		getCookie('uid').indexOf(data.sender.id) >= 0 && document.getElementsByClassName('preview').length > 0 && document.getElementsByClassName('preview')[0].remove();

		messages.innerHTML += newMsg;
		message[message.length - 1].scrollIntoView({ block: 'end', inline: 'end' });
		(getCookie('uid').indexOf(data.sender.id) < 0) && bell.play();
	}
	else {
		messages.insertAdjacentHTML('afterbegin', newMsg);
		for (let i = message.length - 1; i >= 0; i--) {
			if (message[i].getAttribute('data-scroll') == 1)
				message[i].scrollIntoView({ block: 'end', inline: 'end' });
			setTimeout(() => message[i].removeAttribute('data-scroll'), 100);
		}
	}
}

function caughtEmptyMsg(err) {

	let input = document.getElementsByClassName('input')[0];

	if ( !hasChild(input, 'error') ) {
		let p = document.createElement('p');
		p.className = 'error show';
		p.innerText = err;
		input.appendChild(p);
		p.addEventListener('animationend', () => {
			p.classList.remove('show');
			p.remove();
		});
	}
}

function showFiles(files) {

	let html = '';

	if (files !== null) {
		for (let file of files) {
			if (file.path.indexOf('image') === 0) {
				html += `<div class="preview_file preview_file-img">
				<img src="/file/${ file.path }" alt="${ file.name }">
				</div>`;
			}
			else {
				html += `<a href="/file/${ file.path }" class="preview_file" download>
				<i class="fa fa-download fa-white preview_file-icon"></i>
				<div class="preview_file-name">${ file.name }</div>
				</a>`;
			}
		}
	}
	return html;
}

function txt2Emoji(str) { return str.replace(/:(\w+[-\w+]*):/g, '<i class="fa fa-$1" data-ic="$1"></i>') }

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

function setCookie(cname, cvalue, expires) {

	let d = new Date();
	d.setTime(d.getTime() + (expires * 24 * 3600000));
	expires = 'expires=' + d.toUTCString();
	document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

function hasChild(el, className) {
	let children = el.children;
	for (let i = children.length - 1; i >= 0; i--)
		if (children[i].classList.contains(className)) return true;
	return false;
}

function MenuActivator(menu) {
	this.listItem = menu.listItem; // list of menu's items
	this.activeClass = menu.activeClass;
	this.url = location.pathname;

	this.getCurrentPage = function (listItem, url) {

		if (url === '/') return listItem[0];

		let segment = url.split('/').pop();
		segment = new RegExp(segment.replace(/\.(html?|php)/, ''), 'i');

		for (let i = listItem.length - 1; i >= 0; i--) {
			if (url !== '/' && segment.test(listItem[i].href)) return listItem[i];
		}
		return;
	}

	this.activate = function () {
		let current = this.getCurrentPage(this.listItem, this.url);
		current && current.classList.add(this.activeClass);
	}
}

Number.prototype.formatTime = function() {
	let d = new Date(this),
	day = d.getDate(),
	month = d.getMonth() + 1,
	y = d.getFullYear(),
	h = d.getHours(),
	m = d.getMinutes();

	if ((new Date(Date.now())).getDate() !== day)
		return `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}/${y} ${h < 10 ? '0' + h : h}:${m < 10 ? '0' + m : m}`;
	return `${h < 10 ? '0' + h : h}:${m < 10 ? '0' + m : m}`;
}