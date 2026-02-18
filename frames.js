const FRAMES = [
  {
    tree: [
      { path: "todo-app", type: "folder" },
      { path: "todo-app/package.json", type: "file" },
      { path: "todo-app/src", type: "folder" },
      { path: "todo-app/src/index.js", type: "file" }
    ],
    selectedFile: "todo-app/package.json",
    content: "{\n  \"name\": \"todo-app\",\n  \"version\": \"1.0.0\",\n  \"description\": \"A simple todo application\",\n  \"main\": \"src/index.js\",\n  \"scripts\": {\n    \"start\": \"node src/index.js\"\n  },\n  \"dependencies\": {}\n}",
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
    content: "class Todo {\n  constructor(title) {\n    this.id = Date.now();\n    this.title = title;\n    this.completed = false;\n    this.createdAt = new Date();\n  }\n\n  toggle() {\n    this.completed = !this.completed;\n    return this;\n  }\n\n  toString() {\n    const status = this.completed ? \"\u2713\" : \"\u25CB\";\n    return `${status} ${this.title}`;\n  }\n}\n\nmodule.exports = { Todo };",
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
    content: "const { Todo } = require(\"./todo\");\n\nclass TodoStore {\n  constructor() {\n    this.todos = [];\n  }\n\n  add(title) {\n    const todo = new Todo(title);\n    this.todos.push(todo);\n    return todo;\n  }\n\n  remove(id) {\n    this.todos = this.todos.filter(t => t.id !== id);\n  }\n\n  toggle(id) {\n    const todo = this.todos.find(t => t.id === id);\n    if (todo) todo.toggle();\n    return todo;\n  }\n\n  list(filter = \"all\") {\n    switch (filter) {\n      case \"active\":\n        return this.todos.filter(t => !t.completed);\n      case \"completed\":\n        return this.todos.filter(t => t.completed);\n      default:\n        return [...this.todos];\n    }\n  }\n\n  get counts() {\n    return {\n      total: this.todos.length,\n      active: this.todos.filter(t => !t.completed).length,\n      completed: this.todos.filter(t => t.completed).length\n    };\n  }\n}\n\nmodule.exports = { TodoStore };",
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
    content: "const { TodoStore } = require(\"./store\");\n\nconst store = new TodoStore();\n\n// Add some sample todos\nstore.add(\"Set up project structure\");\nstore.add(\"Implement Todo class\");\nstore.add(\"Build the store layer\");\nstore.add(\"Write the CLI interface\");\nstore.add(\"Add persistence with JSON file\");\nstore.add(\"Write unit tests\");\nstore.add(\"Add due dates feature\");\nstore.add(\"Implement priority levels\");\nstore.add(\"Add search functionality\");\nstore.add(\"Create export to markdown\");\n\n// Mark first few as completed\nstore.toggle(store.todos[0].id);\nstore.toggle(store.todos[1].id);\nstore.toggle(store.todos[2].id);\n\n// Display current state\nconsole.log(\"\\n--- Todo App ---\\n\");\n\nconst all = store.list();\nall.forEach(todo => {\n  console.log(\"  \" + todo.toString());\n});\n\nconst { total, active, completed } = store.counts;\nconsole.log(`\\n  ${completed}/${total} completed, ${active} remaining\\n`);\n\n// Filter examples\nconsole.log(\"--- Active ---\");\nstore.list(\"active\").forEach(t => {\n  console.log(\"  \" + t.toString());\n});\n\nconsole.log(\"\\n--- Completed ---\");\nstore.list(\"completed\").forEach(t => {\n  console.log(\"  \" + t.toString());\n});\n\nconsole.log();",
    language: "javascript",
    scrollLine: 28,
    highlights: [30, 31, 35, 36, 37]
  }
];
