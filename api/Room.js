module.exports = Room;

function Room(db) {
	const room = db.collection('room');

	/**
	 * prepare room for chatters
	 * @method create
	 * @param  {object} data { name: room's name, users: uid array }
	 * @return {roomId}
	 */
	this.create = function(data) {

		return room.findOneAndUpdate(
			{ users: data.users },
			{ $set: { name: data.name } },
			{ upsert: true }
		);
	};
}