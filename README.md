# Messpresso
A webpage for realtime chat using Node.js

## Purpose
Learn about Node.js

## Build status

[![Build Status](https://img.shields.io/badge/build-developing-blue.svg)]()

## Technologies
- Node.js 10.16.0
- MongoDB
- Socket.io

## Features
- Realtime chat with friends
- Send attachments in chat
- Find friends to chat

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
- [x] multi languages
- [ ] search for user
- [x] user upload
- images, multi-media
- compressed files
- [ ] compressed media files for better UI

- [x] forgot password
	- [ ] change password in settings
- [ ] user management
	- [ ] block
	- [ ] group chat
	- [ ] delete messages
	- [ ] change background

- [ ] video call, sound call
- [ ] update users list when a new one register

#### What news
- See [CHANGELOG.md](CHANGELOG.md)

#### Bugs
- upload heavy files cause the server runs slow down (high)
- sometimes "someone is typing" does not disappear (low)
- scroll to the newest message isn't at right position on the first load (low)
- verify user in a room (low)
- sometimes old messages are not loaded in the first time login (very low)

## Installation
**Prequisites: some knowledge about Node.js and MongoDB**
- Install [Node.js](https://nodejs.org)
- Install [MongoDB](https://www.mongodb.com)
- Run MongoDB
- Clone or download this project then uncompress it
- See `scripts` section in `package.json` to run

## License
Copyright © [Phạm Trung Kiên]()

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.