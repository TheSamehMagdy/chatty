const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, '../public');

app.use(express.static(publicPath));

io.on('connection', (socket) => {
	console.log('New WebSocket connection!');
	
	socket.on('join', ({ username, room }, cb) => {
		const { error, user } = addUser({ id: socket.id, username, room });

		if (error) {
			return cb(error);
		}

		socket.join(user.room);
		socket.emit('message', generateMessage('Welcome to Chatty!'));
		socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined the room.`));
		cb();
	});

	socket.on('sendMessage', (message, cb) => {
		const filter = new Filter();
		if (filter.isProfane(message)) {
			return cb('Sorry, profanity is not allowed');
		}
		io.emit('message', generateMessage(message));
		cb();
	});

	socket.on('shareLocation', (location, cb) => {
		io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${location.latitude},${location.longitude}`));
		cb();
	});

	socket.on('disconnect', () => {
		io.emit('message', generateMessage('A user has left the chat.'));
	});
});

server.listen(port, () => {
	console.log(`Server running on port ${port}`);
});