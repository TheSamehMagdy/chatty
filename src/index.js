const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, '../public');

app.use(express.static(publicPath));

io.on('connection', (socket) => {
	console.log('New WebSocket connection!');
	socket.emit('message', 'Welcome to Chatty!');
	socket.broadcast.emit('message', 'A new user has joined the chat.');

	socket.on('sendMessage', (message) => {
		io.emit('message', message);
	});

	socket.on('disconnect', () => {
		io.emit('message', 'A user has left the chat.');
	});
});

server.listen(port, () => {
	console.log(`Server running on port ${port}`);
});