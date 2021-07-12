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

const locationBtn = document.querySelector('#share-location');
locationBtn.addEventListener('click', () => {
	if (!navigator.geolocation) {
		return alert('Sorry, Geolocation is not supported by your browser.');
	}

	navigator.geolocation.getCurrentPosition((position) => {
		socket.emit('shareLocation', {
			latitude: position.coords.latitude,
			longitude: position.coords.longitude
		});
	});
});