// const mongoose = require('mongoose');

// const Room = require('../../models/room');
// const User = require('../../models/user');
// const error = require('../../helpers/error');

// exports.delete = (req, res, next) => {

// 	Room
// 		.deleteOne({ _id: req.params.id })
// 		.then(result => {

// 		})
// 		.catch(next);
// };

// exports.update = (req, res, next) => {

// 	if ( !/^([a-z0-9]){24}$/i.test(req.params.id) || (!req.body.name && !req.body.uid) )
// 		throw error('', { status: 204 });

// 	let newMems = Promise.resolve(null), uid = [];

// 	if (!!req.body.uid && req.body.uid.trim().length > 0) {

// 		uid = JSON.parse(req.body.uid);
// 		uid.push(req.body.tokenPayload.uid);

// 		for (let i = uid.length; --i >= 0;)
// 			if ( !/^([a-z0-9]){24}$/i.test(uid[i]) )
// 				uid.splice(i, 1);

// 		newMems = User
// 			.find({ _id: { $in: uid } })
// 			.select('nickname')
// 			.then(users => {

// 				const mems = [];

// 				for (let i = users.length; --i >= 0;)
// 					if (users[i] !== null) {

// 						mems.push({
// 							_id: users[i]._id,
// 							nickname: users[i].nickname,
// 							role: (users.length - 1 === i) ? 'admin' : 'member'
// 						});
// 					}

// 				return mems;
// 			});
// 	}

// 	const room = Room
// 		.findById(req.params.id)
// 		.select('name users')
// 		.then(room => {

// 			if (room === null) return Promise.reject( error('Conversation not found') );

// 			const oldUid = [];
// 			for (let i = room.users.length; --i >= 0;)
// 				oldUid.push(room.users[i]._id);

// 			return { room, oldUid: oldUid };
// 		});

// 	Promise.all([newMems, room])
// 	.then(result => {

// 		const newMems = result[0],
// 				oldUid = result[1] && result[1].oldUid || null,
// 				room = result[1] && result[1].room || null;
// 		let changed = false;

// 		if (req.body.name && room.name !== req.body.name && req.body.name.trim().length > 0) {

// 			changed = true;
// 			room.name = req.body.name;
// 		}

// 		if (newMems !== null) {

// 			if (uid.length > 0 && oldUid.length !== uid.length) {

// 				changed = true;
// 				room.users = newMems;
// 			}
// 			else {
// 				uid.sort(); oldUid.sort();
// 				for (let i = uid.length; --i >= 0;)
// 					if (uid[i] !== oldUid[i]) {

// 						changed = true;
// 						room.users = newMems;
// 						break;
// 					}
// 			}
// 		}

// 		changed && room.save();

// 		res.json({
// 			ok: true,
// 			result: {
// 				name: req.body.name,
// 				members: newMems || room.users
// 			}
// 		});
// 	})
// 	.catch(next);
// };

// exports.create = (req, res, next) => {

// 	const uid = JSON.parse(req.body.uid);
// 	uid.push(req.body.tokenPayload.uid);

// 	// remove malform ids
// 	for (let i = uid.length; --i >= 0;)
// 		if ( !/^([a-z0-9]){24}$/i.test(uid[i]) )
// 			uid.splice(i, 1);

// 	User
// 		.find({ _id: { $in: uid } })
// 		.select('nickname')
// 		.then(users => {

// 			const mems = [];

// 			for (let i = users.length; --i >= 0;)
// 				if (users[i] !== null) {

// 					mems.push({
// 						_id: users[i]._id,
// 						nickname: users[i].nickname,
// 						role: (users.length - 1 === i) ? 'admin' : 'member'
// 					});
// 				}

// 			return mems;
// 		})
// 		.then(users => {

// 			// if users.length = 2 then create conversation for two people
// 			// if users.length = 1 so they are talking to themselves

// 			const rid = mongoose.Types.ObjectId();
// 			const room = new Room({
// 				_id: rid,
// 				name: req.body.name || 'Conversation ' + JSON.stringify(rid).replace(/[a-z"]/gi, ''),
// 				users: users
// 			});

// 			return room.save();
// 		})
// 		.then(newRoom => {

// 			res.status(201).json({
// 				id: newRoom._id,
// 				members: newRoom.users,
// 				name: newRoom.name,
// 			});
// 		})
// 		.catch(next);
// };