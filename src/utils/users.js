const users = [];

// Track new user
const addUser = ({id, username, room}) => {
	// Clean data
	username = username.trim().toLowerCase();
	room = room.trim().toLowerCase();

	// Validate data
	if (!username || !room) {
		return {
			error: 'Username and room are required.'
		};
	}

	// Check for existing user in room
	const existingUser = users.find((user) => {
		return user.room === room && user.username === username;
	});

	// Validate username
	if (existingUser) {
		return {
			error: 'Username is in use. Please choose another.'
		};
	}

	// Store user
	const user = { id, username, room };
	users.push(user);
	return { user };
};