# CodeDeck

A slide deck for code. Define frames, step through them.

CodeDeck turns an array of editor states into a presentation you can step through with arrow keys. Each frame describes what the file tree looks like, which file is open, what the code says, where to scroll, and what to highlight. That's it.

No timeline editors. No drag and drop. No render times. Just declare your states and present.

## Quick start

```
.
├── index.html   # the viewer
└── frames.js    # your presentation data
```

Open `index.html` in a browser. Use **Left** / **Right** arrow keys to step through frames.

## Authoring frames

Edit `frames.js`. It exports a single `const FRAMES` array. Each entry is one slide:

```js
const FRAMES = [
  {
    tree: [
      { path: "src", type: "folder" },
      { path: "src/index.js", type: "file" }
    ],
    selectedFile: "src/index.js",
    language: "javascript",
    content: "console.log('hello')",
    scrollLine: 0,
    highlights: [1]
  }
];
```

`index.html` loads this file via `<script src="frames.js">` — no server required, works from `file://`.

## Frame schema

| Field          | Type               | Description                                                                 |
|----------------|--------------------|-----------------------------------------------------------------------------|
| `tree`         | `{ path, type }[]` | File tree entries. Type is `"file"` or `"folder"`. Depth derived from path. |
| `selectedFile` | `string`           | Path of the currently open file.                                            |
| `language`     | `string`           | Language identifier (for future syntax highlighting).                       |
| `content`      | `string`           | Plain text content of the open file.                                        |
| `scrollLine`   | `number`           | 0-indexed line to scroll into view.                                         |
| `highlights`   | `number[]`         | 1-indexed line numbers to highlight.                                        |

## Syntax highlighting

CodeDeck uses [highlight.js](https://highlightjs.org/) loaded from CDN for syntax highlighting. JavaScript is included by default. To add more languages, add the corresponding `<script>` tag from [cdnjs](https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/languages/):

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/languages/python.min.js"></script>
```

All code passes through a single `highlightCode(content, language)` function. If highlight.js doesn't have the requested language registered, it falls back to plain unstyled text.

## License

MIT
