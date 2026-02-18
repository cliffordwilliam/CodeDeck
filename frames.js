const FRAMES = [
  {
    tree: [
      { path: "todo-app", type: "folder" },
      { path: "todo-app/package.json", type: "file" },
      { path: "todo-app/src", type: "folder" },
      { path: "todo-app/src/index.js", type: "file" }
    ],
    selectedFile: "todo-app/package.json",
    content: `{
    "name": "todo-app",
    "version": "1.0.0",
    "scripts": {
      "start": "node src/index.js",
    }
}`,
    language: "json",
    scrollLine: 0,
    highlights: [4, 5]
  },
  {
    tree: [
      { path: "todo-app", type: "folder" },
      { path: "todo-app/package.json", type: "file" },
      { path: "todo-app/src", type: "folder" },
      { path: "todo-app/src/index.js", type: "file" },
      { path: "todo-app/src/todo.js", type: "file" }
    ],
    selectedFile: "todo-app/src/todo.js",
    content: `class Todo {
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
    return \`\${status} \${this.title}\`;
  }
}

module.exports = { Todo };`,
    language: "javascript",
    scrollLine: 0,
    highlights: [1, 9, 10, 11]
  },
  {
    tree: [
      { path: "todo-app", type: "folder" },
      { path: "todo-app/package.json", type: "file" },
      { path: "todo-app/src", type: "folder" },
      { path: "todo-app/src/index.js", type: "file" },
      { path: "todo-app/src/store.js", type: "file" },
      { path: "todo-app/src/todo.js", type: "file" }
    ],
    selectedFile: "todo-app/src/store.js",
    content: `const { Todo } = require("./todo");

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

module.exports = { TodoStore };`,
    language: "javascript",
    scrollLine: 0,
    highlights: [8, 9, 10, 11]
  },
  {
    tree: [
      { path: "todo-app", type: "folder" },
      { path: "todo-app/package.json", type: "file" },
      { path: "todo-app/src", type: "folder" },
      { path: "todo-app/src/index.js", type: "file" },
      { path: "todo-app/src/store.js", type: "file" },
      { path: "todo-app/src/todo.js", type: "file" }
    ],
    selectedFile: "todo-app/src/index.js",
    content: `const { TodoStore } = require("./store");

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
console.log("\\n--- Todo App ---\\n");

const all = store.list();
all.forEach(todo => {
  console.log("  " + todo.toString());
});

const { total, active, completed } = store.counts;
console.log(\`\\n  \${completed}/\${total} completed, \${active} remaining\\n\`);

// Filter examples
console.log("--- Active ---");
store.list("active").forEach(t => {
  console.log("  " + t.toString());
});

console.log("\\n--- Completed ---");
store.list("completed").forEach(t => {
  console.log("  " + t.toString());
});

console.log();`,
    language: "javascript",
    scrollLine: 28,
    highlights: [30, 31, 35, 36, 37]
  }
];

