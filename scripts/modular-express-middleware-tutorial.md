text: Welcome! In this tutorial, we’re building a modular Express Middleware system. We'll start with the package.json to define our dependencies and the start script for our server.
selectedFile: server-demo/package.json
scrollLine: 0
highlights: [7, 8, 9, 10, 11]

```json
{
  "name": "express-middleware-demo",
  "version": "1.0.0",
  "description": "A demo of custom middleware in Express",
  "main": "index.js",
  "dependencies": {
    "express": "^4.18.2"
  },
  "scripts": {
    "start": "node index.js"
  }
}

```

---

text: First, we create a logger middleware. This function intercepts every request to log the HTTP method and the URL along with a timestamp to the console.
selectedFile: server-demo/middleware/logger.js
scrollLine: 0
highlights: [1, 2, 3, 4, 5]

```javascript
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} request to ${req.url}`);
  next();
};

module.exports = requestLogger;

```

---

text: Next, we implement an authentication middleware. It checks for an authorization header; if it's missing, it blocks the request and returns a 401 Unauthorized status.
selectedFile: server-demo/middleware/auth.js
scrollLine: 0
highlights: [1, 2, 3, 5, 6, 7, 10]

```javascript
const fakeAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ 
      error: "Unauthorized: No token provided" 
    });
  }
  
  next();
};

module.exports = fakeAuth;

```

---

text: Now we assemble everything in index.js. We'll apply the logger globally and use the auth middleware specifically to protect our dashboard route.
selectedFile: server-demo/index.js
scrollLine: 0
highlights: [2, 3, 9, 17]

```javascript
const express = require('express');
const logger = require('./middleware/logger');
const auth = require('./middleware/auth');

const app = express();
const PORT = 3000;

// Global Middleware
app.use(logger);

// Public Route
app.get('/', (req, res) => {
  res.send('Welcome to the Public API!');
});

// Protected Route
app.get('/api/dashboard', auth, (req, res) => {
  res.json({ data: "Sensitive information." });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

```

---

text: That's it! You've built a modular server. Using middleware keeps your code clean and organized. Thanks for watching, and happy coding!
selectedFile: server-demo/index.js
scrollLine: 15
highlights: [21, 22, 23]

```javascript
const express = require('express');
const logger = require('./middleware/logger');
const auth = require('./middleware/auth');

const app = express();
const PORT = 3000;

// Global Middleware
app.use(logger);

// Public Route
app.get('/', (req, res) => {
  res.send('Welcome to the Public API!');
});

// Protected Route
app.get('/api/dashboard', auth, (req, res) => {
  res.json({ data: "Sensitive information." });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

```

---