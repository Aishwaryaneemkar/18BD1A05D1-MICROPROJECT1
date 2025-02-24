const express = require('express');
const bodyParser = require('body-parser');
let jwt = require('jsonwebtoken');
let config = require('./config');
let middleware = require('./middleware');
const cors = require('cors');
const hospitalRoutes = require('./hospital');

class HandlerGenerator {
  login (req, res) {
    let username = req.body.username;
    let password = req.body.password;
    // For the given username fetch user from DB
    let mockedUsername = 'admin';
    let mockedPassword = 'password';

    if (username && password) {
      if (username === mockedUsername && password === mockedPassword) {
        let token = jwt.sign({username: username},
          config.secret,
          { expiresIn: '24h' // expires in 24 hours
          }
        );
        // return the JWT token for the future API calls
        res.json({
          success: true,
          message: 'Authentication successful!',
          token: token
        });
      } else {
        res.status(403).json({
          success: false,
          message: 'Incorrect username or password'
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: 'Authentication failed! Please check the request'
      });
    }
  }
  index (req, res) {
    res.json({
      success: true,
      message: 'Index page'
    });
  }
}

let tokenStorage = {};

// Store the token after login
function login() {
  fetch('http://localhost:1100/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: 'admin',
      password: 'password'
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      tokenStorage.token = data.token;
      console.log('Login successful!');
      fetchProtectedData(); // Fetch protected data after successful login
    } else {
      console.log('Login failed:', data.message);
    }
  });
}

// Include the token in the authorization header for subsequent requests
function fetchProtectedData() {
  const token = tokenStorage.token;
  fetch('http://localhost:1100/api/HospitalDetails', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log('Protected data:', data);
  });
}

// Example usage
login();

// Starting point of the server
function main () {
  let ap = express(); // Export app for other routes to use
  let handlers = new HandlerGenerator();
  const port = 1100;
  ap.use(cors()); // Add this line to enable CORS
  ap.use(bodyParser.urlencoded({ // Middleware
    extended: true
  }));
  ap.use(bodyParser.json());
  // Routes & Handlers
  ap.post('/login', handlers.login);
  ap.get('/', middleware.checkToken, handlers.index);
  ap.use('/api', hospitalRoutes);
  ap.listen(port, () => console.log(`Server is listening on port: ${port}`));
}

main();