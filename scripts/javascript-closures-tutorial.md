text: Hey everyone! Today we are diving into closures in JavaScript. Closures sound fancy, but they are actually something you have probably already used without realizing it. By the end of this video you will understand exactly how they work and be able to use them on purpose.
selectedFile: closures.js

```js
// JavaScript Closures
// What they are, why they matter,
// and how to use them in real code
```

---

text: Let's start with the foundation. In JavaScript, functions can be defined inside other functions. The inner function has access to variables declared in the outer function. That is the core idea behind a closure.
selectedFile: closures.js

```js
function outer() {
  const message = 'hello';

  function inner() {
    console.log(message); // hl
  }

  return inner;
}
```

---

text: Here is the magic part. When we call outer, it finishes running and returns inner. But when we later call inner, it still has access to message even though outer is done. That is the closure — the inner function remembers the environment where it was created.
selectedFile: closures.js

```js
const greet = outer();
greet(); // 'hello' // hl
```

---

text: So why is this useful? One of the biggest wins is private state. JavaScript does not have a private keyword for plain functions, but closures give us the same effect. Let's build a counter.
selectedFile: counter.js

```js
function createCounter() {
  let count = 0; // hl

  return {
    increment() { count += 1; },
    decrement() { count -= 1; },
    getCount() { return count; },
  };
}
```

---

text: The count variable is sealed inside createCounter. The only way to read or change it is through the three methods we returned. Nobody from the outside can touch count directly.
selectedFile: counter.js

```js
const counter = createCounter();

counter.increment();
counter.increment();
counter.increment();

console.log(counter.getCount()); // 3
console.log(counter.count);      // undefined // hl
```

---

text: Now let's look at another practical pattern — memoization. This is a technique where we cache the result of a function call so we do not compute it again. Closures make this clean and self-contained.
selectedFile: utils/memoize.js

```js
function memoize(fn) {
  const cache = {}; // hl

  return function (...args) {
    const key = JSON.stringify(args);

    if (key in cache) {
      return cache[key];
    }

    const result = fn(...args);
    cache[key] = result;
    return result;
  };
}
```

---

text: The cache object lives inside the closure. Each memoized function gets its own private cache that sticks around between calls but is completely invisible from the outside.
selectedFile: utils/memoize.js

```js
// inside the returned function
const key = JSON.stringify(args);
if (key in cache) { // hl
  return cache[key]; // hl
}
```

---

text: Let's test it out. We will memoize a naive recursive fibonacci function. Without memoization this gets painfully slow around 35 or so. With it, the second call is instant.
selectedFile: utils/memoize.js

```js
function slowFib(n) {
  if (n <= 1) return n;
  return slowFib(n - 1) + slowFib(n - 2);
}

const fastFib = memoize(slowFib); // hl

console.log(fastFib(35)); // computed once
console.log(fastFib(35)); // instant from cache
```

---

text: Closures also power the function factory pattern. A factory returns a new function that is pre-configured with the arguments you passed in. Each returned function captures its own copy of those arguments.
selectedFile: factories.js

```js
function createMultiplier(factor) {
  return function (number) {
    return number * factor; // hl
  };
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(double(5));  // 10
console.log(triple(5));  // 15
```

---

text: Double always multiplies by two and triple always multiplies by three, because each closure captured a different value of factor. They do not interfere with each other.
selectedFile: factories.js

```js
const double = createMultiplier(2); // hl
const triple = createMultiplier(3); // hl
// each one has its own private copy of factor
```

---

text: Now let's talk about a classic gotcha — closures inside loops. Before the let keyword, this bug caused a lot of confusion. Watch what happens with var.
selectedFile: loop-gotcha.js

```js
for (var i = 0; i < 3; i++) {
  setTimeout(function () {
    console.log(i); // hl
  }, 100);
}
// prints: 3, 3, 3
```

---

text: All three callbacks share the same i because var is function-scoped, not block-scoped. By the time the timeouts fire, the loop has finished and i is 3. The fix is simple — use let instead.
selectedFile: loop-gotcha.js

```js
for (let i = 0; i < 3; i++) { // hl
  setTimeout(function () {
    console.log(i);
  }, 100);
}
// prints: 0, 1, 2
```

---

text: With let, each iteration of the loop creates a fresh binding for i, so each closure captures the correct value. This is one of the big reasons modern JavaScript moved away from var.
selectedFile: loop-gotcha.js

```js
// Each iteration creates a new scope:
// iteration 0 → closure captures i = 0
// iteration 1 → closure captures i = 1
// iteration 2 → closure captures i = 2
```

---

text: Let's build one more real-world example — a rate limiter. This function wraps another function and ensures it can only be called once within a given time window. Closures are perfect for this because we need persistent state between calls.
selectedFile: utils/rate-limit.js

```js
function rateLimit(fn, delay) {
  let lastCall = 0; // hl

  return function (...args) {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      return fn(...args);
    }
  };
}
```

---

text: The lastCall variable is private to each rate-limited function. It tracks when the function was last invoked. If not enough time has passed since the last call, the invocation is silently dropped.
selectedFile: utils/rate-limit.js

```js
const limitedLog = rateLimit(console.log, 1000);

limitedLog('first');  // prints immediately
limitedLog('second'); // skipped — too soon
// wait 1 second...
limitedLog('third');  // prints
```

---

text: And that wraps up closures in JavaScript! To recap — a closure is simply a function plus the variables it remembers from the scope where it was created. They give you private state, factories, memoization, rate limiting, and a whole lot more. Thanks for watching and we will see you in the next one!
selectedFile: closures.js

```js
// Closures — key takeaways:
// 1. A function retains access to its outer scope
// 2. This enables private variables and state
// 3. Factories, memoization, and rate limiting all use closures
// 4. Use let/const in loops to avoid shared-variable bugs
```

---
