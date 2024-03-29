const lang = require('../public/lang/lang'),
    Validation = require('./Validation')(),
    ObjectId = require('mongodb').ObjectID,
    User = require('./User'),
    Room = require('./Room'),
    formidable = require('formidable'),
    fs = require('fs');

module.exports = Dialog;

function Dialog(db) {

    let dialog = db.collection('dialog'),
        user = db.collection('user'),
        room = new Room(db),
        self = this;

    this.upload = function(req, res) {

        const form = new formidable.IncomingForm(),
            files = [];

        form.uploadDir = 'upload/';
        form.keepExtensions = true;
        form.maxFileSize = 25 * 1024 * 1024;
        form.multiples = true;

        form.parse(req);
        form.on('fileBegin', (name, file) => {

                if (file.type.match('image/*')) {
                    file.path = changeDir(file.path, 'image');
                }
                else if (file.type.match('audio/*')) {
                    file.path = changeDir(file.path, 'sound');
                }
                else if (Validation.allowedFile(file.name)) {
                    file.path = changeDir(file.path, 'others');
                }
                else {
                    form._error(new Error('Some files type are not allowed'));
                }
            })
            .on('file', (name, file) => {

                if (file.size === 0) {
                    fs.unlink(file.path, (err) => {
                        if (err) console.error(err);
                    });
                    form._error(new Error('Please upload a true file'));
                    console.error('loi roi');
                    return;
                }

                files.push({
                    path: file.path.slice(7),
                    name: file.name
                });
            })
            .on('error', err => {
                console.log(err.message);
                // rewrite error message, so dirty
                if (err.message.indexOf('maxFileSize') >= 0)
                    err.message = 'The file must be less than 25MB';

                res.status(400).json({
                    success: false,
                    info: err.message
                });
            });
        form.on('end', () => {

            res.json({
                success: true,
                info: files
            });
        });
    };

    this.transfer = function(io, socket, userList) {

        const regexCookie = /^j:"(.*)"$/;

        socket.on('typing', data => {

            let uid = data.uid.match(regexCookie);
            if (uid !== null) {

                uid = uid[1];
                user.find({ _id: new ObjectId(uid) }).project({ username: 1 })
                    .next((err, userInfo) => {

                        if (err) console.error(err);

                        if (userInfo !== null) {

                            const room = Object.keys(socket.rooms)[1];
                            socket.to(room).emit('_typing', {
                                username: userInfo.username,
                                typing: data.typing
                            });
                        }
                    });
            }
        });

        socket.on('send message', (data, callback) => {

            data.msg = JSON.parse(data.msg);

            if (Validation.isEmpty(data.msg.text, 'message') && Validation.isEmpty(data.msg.file, 'message'))
                return callback(Validation.error.message);

            let uid = data.senderId.match(regexCookie);
            if (uid !== null) uid = uid[1];
            data.msg.text = Validation.xssClean(data.msg.text);
            // check if user is in room instead
            user.find({ _id: new ObjectId(uid) }).project({ username: 1 })
                .next((err, userInfo) => {

                    if (err) console.error(err);
                    console.log('socket.rooms', socket.rooms);

                    const roomId = Object.keys(socket.rooms)[1];

                    if (userInfo !== null) {

                        const usersInRoom = db.collection('room').findOne({ _id: ObjectId(roomId) }, { projection: { users: 1 } });
                        const newDialog = dialog
                            .insertOne({
                                rid: roomId,
                                sender: {
                                    id: uid,
                                    name: userInfo.username
                                },
                                msg: data.msg,
                                created: data.created
                            });

                        Promise.all([usersInRoom, newDialog])
                            .then(([usersInRoom, newDialog]) => {

                                io.in(roomId).emit('new message', newDialog.ops[0]);
                                userList.forEach(user => {

                                    user.socketId.forEach(socketid => {
                                        io.to(socketid).emit('test', 'ping')
                                    })
                                });
                            })
                            .catch(err => console.error(err));
                    }
                });
        });
    };

    this.loadViewDialog = function(req, res) {

        if (!/^\w+$/.test(req.params.id))
            return res.render('404');

        let users = [],
            chatWith = { username: lang.print('chat.hall'), id: null };

        User(db).exists(req, res)
            .then(result => {
                if (!result) return Promise.reject(res.redirect('/login'));
                return listUsers();
            })
            .then(_users => {

                let uid = [],
                    roomName = '';

                for (let user of _users) {

                    if (req.params.id == user._id) chatWith = user;
                    if ((req.cookies.uid == user._id) || (req.params.id == user._id)) uid[uid.length] = user._id;
                }
                users = _users;

                if (req._parsedUrl.pathname.indexOf('t/hall') >= 0) uid = [];
                roomName = 'hall';

                return room.create({
                    users: uid,
                    name: roomName
                });
            })
            .then(_room => {

                User(db).setLocale(req.cookies, res);

                res.render('index', {
                    ua: require('./UA')(req.headers['user-agent']),
                    users: users,
                    rid: _room.lastErrorObject.upserted || _room.value._id,
                    chatWith: chatWith,
                    phEditor: lang.print('chat.phEditor', req.cookies.lang),
                    phSearch: lang.print('chat.phSearch', req.cookies.lang),
                    hall: lang.print('chat.hall', req.cookies.lang),
                    titleEmoji: lang.print('chat.titleEmoji', req.cookies.lang),
                    titleAttach: lang.print('chat.titleAttach', req.cookies.lang),
                    titleSend: lang.print('chat.titleSend', req.cookies.lang),
                    statusOn: lang.print('chat.statusOn', req.cookies.lang),
                    contactTitle: lang.print('chat.contactTitle', req.cookies.lang),
                    logout: lang.print('chat.logout', req.cookies.lang),
                    changeBg: lang.print('chat.changeBg', req.cookies.lang),
                    changeLang: lang.print('chat.changeLang', req.cookies.lang),
                    icons: ['smile', 'angry', 'dizzy', 'flushed', 'frown', 'frown-open', 'grimace', 'grin', 'grin-beam', 'grin-beam-sweat', 'grin-hearts', 'grin-squint', 'grin-squint-tears', 'grin-stars', 'grin-tongue', 'grin-tongue-squint', 'grin-tongue-wink', 'grin-wink', 'kiss', 'kiss-beam', 'kiss-wink-heart', 'laugh', 'laugh-beam', 'laugh-squint', 'meh', 'meh-blank', 'tired', 'meh-rolling-eyes', 'sad-cry', 'sad-tear', 'smile-beam', 'smile-wink', 'surprise']
                });
            })
            .catch(err => console.error(err));
    };

    this.loadMessages = function(req, res) {

        dialog.find({ rid: req.query.rid }).limit(20).skip(parseInt(req.query.step)).sort({ 'created': -1 }).toArray((err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    success: false,
                    content: 'something went wrong'
                });
            }

            res.set('Content-Type', 'application/json');

            if (result.length > 0) {

                result[0].scroll = 1;
                res.json({
                    success: true,
                    content: result
                });
            }
            else res.json({
                success: true,
                content: null
            });
        });
    }

    function changeDir(path, name) {

        const delimiter = process.env.NODE_ENV !== 'production' ? '\\' : '/';
        let dir = path.split(delimiter);
        dir.splice(1, 0, name);
        return dir.join(delimiter);
    }

    function listUsers() {
        return new Promise((resolve, reject) => {
            user.find().project({ 'username': 1 })
                .toArray((err, result) => {
                    if (err) reject(err);
                    resolve(result);
                });
        });
    }

    return this;
}