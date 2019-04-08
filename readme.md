# Eightplus
A webpage for realtime chat using Node.js

## Purpose
Learn about Node.js

## Build status

[![Build Status](https://img.shields.io/badge/build-developing-blue.svg)]()

## Technologies
- Node.js
- MongoDB
- Socket.io

## Features
- realtime chat with anyone
- send attachments in chat

## Todos
- [x] load old messages
- [x] autoscroll to newest message
- [x] private chatting
- [x] public chatting
- [x] login, register
- [x] icons in chats
- [x] notification
	- [ ] notify when user isn't in the same room
- [x] users's active status
	- [ ] let users control their status
- [x] someone is typing...
- [ ] multi languages
- [ ] search for user
- [x] user upload
- images, multi-media
- compressed files

- [x] forgot password
	- [ ] change password in settings
- [ ] user management
	- [ ] block
	- [ ] group chat
	- [ ] delete messages
	- [ ] change background

- [ ] video call, sound call (I think I will never do this)

#### What news
- improve scroll to load messages experience and performance

#### Bugs
- upload heavy files cause the server runs slow down (high)
- sometimes "someone is typing" does not disappear (low)
- scroll to the newest message isn't at right position on the first load (low)
- verify user in a room (low)
- sometimes old messages are not loaded in the first time login (very low)

## Installation
### Prequisites: some knowledge about Node.js and MongoDB
- Install [Node.js](https://nodejs.org)
- Install [MongoDB](https://www.mongodb.com)
- Run MongoDB
- Clone or download this project then uncompress it
- Open cmd at this project and
```bash
run "npm start"
```

## License
A short snippet describing the license (MIT, Apache etc)

MIT © [Phạm Trung Kiên]()
