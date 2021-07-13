/* eslint-disable no-undef */

const socket = io();

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $locationBtn = document.querySelector('#share-location');
const $messages = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;

socket.on('message', (message) => {
	const html = Mustache.render(messageTemplate, {
		message
	});
	$messages.insertAdjacentHTML('beforeend', html);
});

socket.on('locationMessage', (url) => {
	const html = Mustache.render(locationTemplate, {
		url
	});
	$messages.insertAdjacentHTML('beforeend', html);
});

$messageForm.addEventListener('submit', (e) => {
	e.preventDefault();

	// Disable form while message is being sent
	$messageFormButton.setAttribute('disabled', 'disabled');

	const message = $messageFormInput.value;
	socket.emit('sendMessage', message, (error) => {
		// Re-enable form
		$messageFormButton.removeAttribute('disabled');

		// Clear input
		$messageFormInput.value = '';
		$messageFormInput.focus();

		if (error) {
			return console.log(error);
		}

		console.log('Message delivered!');
	});
}); 


$locationBtn.addEventListener('click', () => {
	if (!navigator.geolocation) {
		return alert('Sorry, Geolocation is not supported by your browser.');
	}

	// Disable button while location is being sent
	$locationBtn.setAttribute('disabled', 'disabled');

	navigator.geolocation.getCurrentPosition((position) => {
		socket.emit('shareLocation', {
			latitude: position.coords.latitude,
			longitude: position.coords.longitude
		}, () => {
			$locationBtn.removeAttribute('disabled');
			console.log('Location shared successfully.');
		});
	});
});