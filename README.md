# CodeDeck

A slide deck for code. Define frames, step through them.

CodeDeck turns a JSON array of editor states into a presentation you can step through with arrow keys. Each frame describes what the file tree looks like, which file is open, what the code says, where to scroll, and what to highlight. That's it.

No timeline editors. No drag and drop. No render times. Just declare your states and present.

## How it works

You write frames like this:

```json
[
  {
    "tree": [
      { "path": "src", "type": "folder" },
      { "path": "src/index.js", "type": "file" }
    ],
    "selectedFile": "src/index.js",
    "language": "javascript",
    "content": "console.log('hello')",
    "scrollLine": 0,
    "highlights": [1]
  }
]
```

CodeDeck renders a sidebar with the file tree and an editor with the code. Arrow keys move between frames. The presentation looks like the editor your audience already uses every day.

## Frame schema

| Field          | Type                         | Description                                  |
|----------------|------------------------------|----------------------------------------------|
| `tree`         | `{ path, type }[]`           | File tree entries. Type is `"file"` or `"folder"`. Depth is derived from the path. |
| `selectedFile` | `string`                     | Path of the currently open file.             |
| `language`     | `string`                     | Language identifier for syntax highlighting. |
| `content`      | `string`                     | Plain text content of the open file.         |
| `scrollLine`   | `number`                     | 0-indexed line to scroll into view.          |
| `highlights`   | `number[]`                   | 1-indexed line numbers to highlight.         |

## Syntax highlighting

CodeDeck renders all code through a single `highlightCode(content, language)` function. By default it returns plain unstyled text. Swap this function with a real highlighter like [Shiki](https://shiki.style/) to get full tokenized syntax coloring using the same grammars and themes as VSCode.

## Roadmap

Things that don't exist yet but probably should:

- Smooth animated transitions between frames
- Terminal panel
- Typing animation mode
- Syntax highlighting via Shiki
- YAML/Markdown authoring format
- Export to video via headless browser
- Presenter notes

## License

MIT
