/* eslint-disable no-undef */

const socket = io();

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $locationBtn = document.querySelector('#share-location');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true });

socket.on('message', (message) => {
	const html = Mustache.render(messageTemplate, {
		username: message.username,
		message: message.text,
		createdAt: moment(message.createdAt).format('h:mm A')
	});
	$messages.insertAdjacentHTML('beforeend', html);
});

socket.on('locationMessage', (locationMessage) => {
	const html = Mustache.render(locationTemplate, {
		username: locationMessage.username,
		url: locationMessage.url,
		createdAt: moment(locationMessage.createdAt).format('h:mm A')
	});
	$messages.insertAdjacentHTML('beforeend', html);
});

socket.on('roomData', ({ room, users }) => {
	const html = Mustache.render(sidebarTemplate, {
		room,
		users
	});
	$sidebar.innerHTML = html;
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

socket.emit('join', {username, room}, (error) => {
	if (error) {
		alert(error);
		location.href = '/';
	}
});