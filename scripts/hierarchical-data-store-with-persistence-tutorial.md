text: Welcome back! Today we're diving into a more complex architecture: a **Hierarchical Data Store with Persistence**. We'll start with the root configuration, where we define our project as a module and set up the necessary scripts.
selectedFile: persistent-store/package.json
scrollLine: 0
highlights: [2, 6, 7, 8]

```json
{
  "name": "persistent-store",
  "version": "1.0.0",
  "type": "commonjs",
  "main": "src/main.js",
  "scripts": {
    "start": "node src/main.js",
    "clean": "rm -rf data/*.json"
  }
}

```

---

text: At the foundation, we have a DiskStorage utility. This handles the raw file system operations, ensuring that our data is safely written to and read from the local disk.
selectedFile: persistent-store/src/lib/storage.js
scrollLine: 0
highlights: [1, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15]

```javascript
const fs = require('fs');
const path = require('path');

class DiskStorage {
  save(filename, data) {
    const filePath = path.join(__dirname, '../../data', filename);
    const content = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, content);
  }

  load(filename) {
    const filePath = path.join(__dirname, '../../data', filename);
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
}

module.exports = DiskStorage;

```

---

text: Moving up the hierarchy, we implement the BaseNode class. This represents a single data point that can have children, allowing us to build a tree-like structure in memory.
selectedFile: persistent-store/src/models/node.js
scrollLine: 0
highlights: [3, 4, 5, 8, 9, 10, 11]

```javascript
class BaseNode {
  constructor(id, value) {
    this.id = id;
    this.value = value;
    this.children = [];
  }

  addChild(node) {
    this.children.push(node);
  }

  toJSON() {
    return {
      id: this.id,
      value: this.value,
      children: this.children.map(c => c.toJSON())
    };
  }
}

module.exports = BaseNode;

```

---

text: Now we create the TreeManager. This service orchestrates the connection between our in-memory nodes and the DiskStorage utility, providing a high-level API for saving the entire state.
selectedFile: persistent-store/src/services/treeManager.js
scrollLine: 0
highlights: [1, 2, 6, 11, 12, 13]

```javascript
const DiskStorage = require('../lib/storage');
const BaseNode = require('../models/node');

class TreeManager {
  constructor() {
    this.storage = new DiskStorage();
    this.root = new BaseNode('root', 'System Registry');
  }

  persist() {
    const data = this.root.toJSON();
    this.storage.save('registry.json', data);
    console.log('Tree state persisted to disk.');
  }
}

module.exports = TreeManager;

```

---

text: Finally, we execute our main entry point. We build a small nested structure representing a system configuration, persist it, and then log the outcome to verify the storage layer.
selectedFile: persistent-store/src/main.js
scrollLine: 0
highlights: [1, 5, 8, 11, 12, 14]

```javascript
const TreeManager = require('./services/treeManager');
const BaseNode = require('./models/node');

const manager = new TreeManager();

// Create nested structure
const userNode = new BaseNode('u1', { name: 'Alice' });
userNode.addChild(new BaseNode('s1', { theme: 'dark' }));

manager.root.addChild(userNode);

// Save everything
manager.persist();
console.log('Process complete.');

```

---

text: That concludes our look at building a persistent hierarchical store! We've covered disk I/O, recursive data structures, and service-based architecture. Thanks for watching!
selectedFile: persistent-store/src/main.js
scrollLine: 0
highlights: [1, 14]

```javascript
const TreeManager = require('./services/treeManager');
const BaseNode = require('./models/node');

const manager = new TreeManager();

// Create nested structure
const userNode = new BaseNode('u1', { name: 'Alice' });
userNode.addChild(new BaseNode('s1', { theme: 'dark' }));

manager.root.addChild(userNode);

// Save everything
manager.persist();
console.log('Process complete.');

```

---