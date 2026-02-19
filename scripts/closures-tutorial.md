text: A closure is one of JavaScript's most fundamental — and most misunderstood — features. At its core, a closure is what happens when a function "remembers" the variables from the scope where it was defined, even after that scope has finished executing.
selectedFile: src/closures/intro.js

```js
function outer() {
  const message = "hello";

  function inner() {
    console.log(message); // inner closes over `message`
  }

  return inner;
}
```

---

text: JavaScript uses lexical scoping — a function can always reach variables from the scope where it was written. When inner looks up message, it walks up the scope chain and finds it in outer.
selectedFile: src/closures/scope.js

```js
const x = "global";

function outer() {
  const x = "outer";

  function inner() {
    console.log(x); // "outer" — nearest scope wins
  }

  inner();
}
```

---

text: Here is where closures get interesting. Even after outer has returned and its local scope is gone, inner still holds a live reference to message. The variable isn't garbage-collected as long as the inner function is alive.
selectedFile: src/closures/remember.js

```js
function outer() {
  const message = "hello";
  return function inner() {
    console.log(message);
  };
}

const greet = outer(); // outer() has finished
greet();               // still prints "hello"
```

---

text: A classic use of closures is a counter. The count variable lives inside makeCounter and can only be changed through the returned function — no one outside can touch it directly.
selectedFile: src/closures/counter.js

```js
function makeCounter() {
  let count = 0;

  return function () {
    count++;
    return count;
  };
}

const counter = makeCounter();
counter(); // 1
counter(); // 2
```

---

text: Each call to makeCounter creates a fresh closure with its own independent count. These two counters don't share state — the closure is acting as a private variable scoped to each instance.
selectedFile: src/closures/counter.js

```js
const a = makeCounter();
const b = makeCounter();

a(); // 1
a(); // 2
b(); // 1 — b has its own count
```

---

text: One of the most common closure bugs involves loops. You might expect this to log 0, 1, 2 — but it logs 3, 3, 3. By the time the callbacks fire, the loop is already done and i is 3.
selectedFile: src/closures/loop-bug.js

```js
for (var i = 0; i < 3; i++) {
  setTimeout(function () {
    console.log(i); // logs 3, 3, 3
  }, 100);
}
```

---

text: The fix is to swap var for let. Unlike var, let is block-scoped — each loop iteration gets its own binding of i, so each closure captures a separate value.
selectedFile: src/closures/loop-fix.js

```js
for (let i = 0; i < 3; i++) { // hl
  setTimeout(function () {
    console.log(i); // now logs 0, 1, 2
  }, 100);
}
```

---

text: Closures also power factory functions. You pass config in once and get back a specialized function. The returned function remembers factor without you needing to pass it on every call.
selectedFile: src/closures/factory.js

```js
function makeMultiplier(factor) {
  return function (n) {
    return n * factor; // hl
  };
}

const double = makeMultiplier(2);
const triple = makeMultiplier(3);

double(5); // 10
triple(5); // 15
```

---

text: Closures show up everywhere in JavaScript — event listeners, array callbacks, module patterns, React hooks. Once you recognize the pattern — inner function plus outer variables — you'll start spotting them in code you've been reading for years.
selectedFile: src/closures/summary.js

```js
// The closure pattern in one line:
// inner function + outer scope variables = closure

// You've already used closures in:
// - setTimeout and setInterval callbacks
// - .map(), .filter(), .reduce()
// - addEventListener handlers
// - React's useState and useEffect
```

---
