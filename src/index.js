const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
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
		socket.emit('message', generateMessage('Chatty', 'Welcome to Chatty!'));
		socket.broadcast.to(user.room).emit('message', generateMessage('Chatty', `${user.username} has joined the room.`));

		io.to(user.room).emit('roomData', {
			room: user.room,
			users: getUsersInRoom(user.room)
		});

		cb();
	});

	socket.on('sendMessage', (message, cb) => {
		const user = getUser(socket.id);
		io.to(user.room).emit('message', generateMessage(user.username, message));
		cb();
	});

	socket.on('shareLocation', (location, cb) => {
		const user = getUser(socket.id);
		io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`));
		cb();
	});

	socket.on('disconnect', () => {
		const user = removeUser(socket.id);
		
		if (user) {
			io.to(user.room).emit('message', generateMessage('Chatty', `${user.username} has left the room.`));
			io.to(user.room).emit('roomData', {
				room: user.room,
				users: getUsersInRoom(user.room)
			});
		}
	});
});

server.listen(port, () => {
	console.log(`Server running on port ${port}`);
});