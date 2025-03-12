// Import required modules
const express = require('express');
const fs = require('fs');
const path = require('path');

// Create an instance of the Express application
const app = express();

// Define the path for the users.json file
const USERS_FILE = path.join(__dirname, 'users.json');

// Middleware to parse JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the /public folder
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Helper function to read the current list of users from users.json.
 * If the file does not exist or if there is an error, an empty array is returned.
 */
function readUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users.json:', error);
    return [];
  }
}

/**
 * Helper function to write an array of users to users.json.
 * @param {Array} users - The array of user objects to save.
 */
function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

/**
 * POST /signup endpoint:
 * Accepts email and password from the signup form,
 * creates a new user object with a timestamp, and appends it to users.json.
 */
app.post('/signup', (req, res) => {
  const { email, password } = req.body;

  // Validate that both email and password are provided
  if (!email || !password) {
    return res.status(400).send('Email and password are required.');
  }

  // Read existing users
  const users = readUsers();

  // Optional: Check if the email is already registered
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.status(400).send('User already exists.');
  }

  // Create a new user object with the current timestamp
  const newUser = {
    email,
    password, // WARNING: In production, please hash passwords before storing!
    timestamp: new Date().toISOString()
  };

  // Append the new user and write back to users.json
  users.push(newUser);
  writeUsers(users);

  // Respond with a success message
  res.status(200).send('Signup successful!');
});

/**
 * POST /login endpoint:
 * Accepts email and password from the login form,
 * checks if the provided credentials match an existing user in users.json,
 * and responds with either a success or error message.
 */
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Validate that both email and password are provided
  if (!email || !password) {
    return res.status(400).send('Email and password are required.');
  }

  // Read existing users from the file
  const users = readUsers();

  // Check for a user with matching email and password
  const user = users.find(user => user.email === email && user.password === password);
  if (user) {
    res.status(200).send('Login successful!');
  } else {
    res.status(401).send('Invalid email or password.');
  }
});

// Start the server on port 3000 (or a port specified in the environment)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
