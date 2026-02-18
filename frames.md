text: Let's start by looking at the project setup. The package dot json defines our todo app and includes a start script.
selectedFile: todo-app/package.json
scrollLine: 0
highlights: [4, 5]

```json
{
    "name": "todo-app",
    "version": "1.0.0",
    "scripts": {
      "start": "node src/index.js",
    }
}
```

---

text: Next, we define the Todo class. It tracks an id, title, and completion status, with a toggle method to flip the state.
selectedFile: todo-app/src/todo.js
scrollLine: 0
highlights: [1, 9, 10, 11]

```javascript
class Todo {
  constructor(title) {
    this.id = Date.now();
    this.title = title;
    this.completed = false;
    this.createdAt = new Date();
  }

  toggle() {
    this.completed = !this.completed;
    return this;
  }

  toString() {
    const status = this.completed ? "✓" : "○";
    return `${status} ${this.title}`;
  }
}

module.exports = { Todo };
```

---

text: The store layer wraps an array of todos and provides add, remove, toggle, list, and counts operations.
selectedFile: todo-app/src/store.js
scrollLine: 0
highlights: [8, 9, 10, 11]

```javascript
const { Todo } = require("./todo");

class TodoStore {
  constructor() {
    this.todos = [];
  }

  add(title) {
    const todo = new Todo(title);
    this.todos.push(todo);
    return todo;
  }

  remove(id) {
    this.todos = this.todos.filter(t => t.id !== id);
  }

  toggle(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) todo.toggle();
    return todo;
  }

  list(filter = "all") {
    switch (filter) {
      case "active":
        return this.todos.filter(t => !t.completed);
      case "completed":
        return this.todos.filter(t => t.completed);
      default:
        return [...this.todos];
    }
  }

  get counts() {
    return {
      total: this.todos.length,
      active: this.todos.filter(t => !t.completed).length,
      completed: this.todos.filter(t => t.completed).length
    };
  }
}

module.exports = { TodoStore };
```

---

text: Finally, the entry point wires everything together — adding todos, toggling completion, filtering by status, and exporting to JSON and Markdown.
selectedFile: todo-app/src/index.js
scrollLine: 52
highlights: [55, 56, 57, 58, 59, 60]

```javascript
const { TodoStore } = require("./store");
const fs = require("fs");

const store = new TodoStore();

// Add some sample todos
store.add("Set up project structure");
store.add("Implement Todo class");
store.add("Build the store layer");
store.add("Write the CLI interface");
store.add("Add persistence with JSON file");
store.add("Write unit tests");
store.add("Add due dates feature");
store.add("Implement priority levels");
store.add("Add search functionality");
store.add("Create export to markdown");

// Mark first few as completed
store.toggle(store.todos[0].id);
store.toggle(store.todos[1].id);
store.toggle(store.todos[2].id);

// Display current state
console.log("\n--- Todo App ---\n");

const all = store.list();
all.forEach(todo => {
  console.log("  " + todo.toString());
});

const { total, active, completed } = store.counts;
console.log(`\n  ${completed}/${total} completed, ${active} remaining\n`);

// Filter examples
console.log("--- Active ---");
store.list("active").forEach(t => {
  console.log("  " + t.toString());
});

console.log("\n--- Completed ---");
store.list("completed").forEach(t => {
  console.log("  " + t.toString());
});

console.log();

// Search functionality
function search(query) {
  return store.list().filter(t =>
    t.title.toLowerCase().includes(query.toLowerCase())
  );
}

const results = search("todo");
console.log(`\n--- Search: "todo" ---`);
results.forEach(t => console.log("  " + t.toString()));

// Export to JSON
function saveToFile(path) {
  const data = store.list().map(t => ({
    id: t.id,
    title: t.title,
    completed: t.completed,
    createdAt: t.createdAt
  }));
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
  console.log(`\nSaved ${data.length} todos to ${path}`);
}

// Export to Markdown
function exportMarkdown(path) {
  const lines = ["# Todo List", ""];
  store.list().forEach(t => {
    const check = t.completed ? "x" : " ";
    lines.push(`- [${check}] ${t.title}`);
  });
  fs.writeFileSync(path, lines.join("\n") + "\n");
  console.log(`Exported markdown to ${path}`);
}

saveToFile("todos.json");
exportMarkdown("todos.md");
```
