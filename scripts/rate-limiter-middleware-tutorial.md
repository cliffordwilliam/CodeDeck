text: Hey everyone! Today we're building a simple in-memory rate limiter middleware for Express from scratch. We'll start with the package.json to define our only dependency.
selectedFile: rate-limiter/package.json
scrollLine: 1
highlights: [6, 7, 8]

```json
{
  "name": "rate-limiter-demo",
  "version": "1.0.0",
  "description": "A simple in-memory rate limiter middleware for Express",
  "main": "server.js",
  "dependencies": {
    "express": "^4.18.2"
  },
  "scripts": {
    "start": "node server.js"
  }
}
```

---

text: Now let's build the core of our rate limiter. We use a Map as our in-memory store. The isRateLimited function tracks how many times a key — like an IP address — has made a request within a sliding time window.
selectedFile: rate-limiter/rateLimiter.js
scrollLine: 1
highlights: [1, 3, 4, 5, 7, 8, 9, 12, 13, 15]

```javascript
const store = new Map();

function isRateLimited(key, limit, windowMs) {
  const now = Date.now();
  const record = store.get(key) || { count: 0, resetAt: now + windowMs };

  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + windowMs;
  }

  record.count += 1;
  store.set(key, record);

  return record.count > limit;
}

module.exports = { isRateLimited };
```

---

text: Next we wrap that logic in a createRateLimiter factory. It returns an Express-compatible middleware function that checks each request's IP against our store. If the limit is exceeded, we respond with a 429 status and block the request.
selectedFile: rate-limiter/rateLimiter.js
scrollLine: 18
highlights: [18, 19, 21, 22, 23, 24, 25, 26, 27, 28, 30]

```javascript
const store = new Map();

function isRateLimited(key, limit, windowMs) {
  const now = Date.now();
  const record = store.get(key) || { count: 0, resetAt: now + windowMs };

  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + windowMs;
  }

  record.count += 1;
  store.set(key, record);

  return record.count > limit;
}

function createRateLimiter(options = {}) {
  const { limit = 10, windowMs = 60000 } = options;

  return function rateLimiterMiddleware(req, res, next) {
    const key = req.ip;
    if (isRateLimited(key, limit, windowMs)) {
      return res.status(429).json({ error: 'Too many requests. Please slow down.' });
    }
    next();
  };
}

module.exports = { createRateLimiter };
```

---

text: Here's the Express server. We import createRateLimiter, configure it to allow 5 requests per 30 seconds, and attach it globally with app.use so every route is protected automatically.
selectedFile: rate-limiter/server.js
scrollLine: 1
highlights: [1, 2, 7, 9]

```javascript
const express = require('express');
const { createRateLimiter } = require('./rateLimiter');

const app = express();
const PORT = 3000;

const limiter = createRateLimiter({ limit: 5, windowMs: 30000 });

app.use(limiter);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome! You are within the rate limit.' });
});

app.get('/data', (req, res) => {
  res.json({ data: [1, 2, 3, 4, 5] });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

---

text: And that's our two routes. Any client that exceeds 5 requests in 30 seconds will be blocked at the middleware layer before it even reaches these handlers. That's the power of middleware — cross-cutting concerns in one place. Thanks for watching!
selectedFile: rate-limiter/server.js
scrollLine: 11
highlights: [11, 12, 13, 15, 16, 17, 19, 20, 21]

```javascript
const express = require('express');
const { createRateLimiter } = require('./rateLimiter');

const app = express();
const PORT = 3000;

const limiter = createRateLimiter({ limit: 5, windowMs: 30000 });

app.use(limiter);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome! You are within the rate limit.' });
});

app.get('/data', (req, res) => {
  res.json({ data: [1, 2, 3, 4, 5] });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

---
