/* eslint-disable no-undef */

const socket = io();

socket.on('message', (msg) => {
	console.log(msg);
});

const messageForm = document.querySelector('#message-form');
messageForm.addEventListener('submit', (e) => {
	e.preventDefault();
	const message = document.querySelector('#message-input').value;
	socket.emit('sendMessage', message);
}); 