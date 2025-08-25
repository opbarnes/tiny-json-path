# tiny-json-path

*(also referred to as **tinyJSONPath** in prose)*

tinyJSONPath is a lightweight JavaScript library for getting and setting values
in JavaScript objects using a small, predictable subset of
[JSONPath](https://en.wikipedia.org/wiki/JSONPath) syntax.

Why use this library?

- **No dependencies** — small and portable.
- **Predictable behavior** — intentionally minimal and easy to reason about.
- **Simple traversal** — avoid pulling in large, full-featured JSONPath
  libraries if you don’t need them.
- **Configuration-friendly** — ideal when you want to reference JSONPath-like
  strings inside configuration files, and then resolve those paths at runtime
  to extract values from objects.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Via ESM (bundlers like Vite/Webpack)](#via-esm-bundlers-like-vitewebpack)
  - [Via UMD (script tag or CDN)](#via-umd-script-tag-or-cdn)
      - [Use a CDN (fastest to try)](#use-a-cdn-fastest-to-try)
      - [Serve the UMD file you installed via npm](#serve-the-umd-file-you-installed-via-npm)
  - [Node.js (ESM only)](#nodejs-esm-only)
      - [Requirements](#requirements)
  - [Tips](#tips)
  - [API Reference](#api-reference)
      - [Getter: `getTinyJsonPath(obj, path)`](#getter-gettinyjsonpathobj-path)
      - [Setter: `setTinyJsonPath(obj, path, value)`](#setter-settinyjsonpathobj-path-value)
- [Examples](#examples)
- [Supported JSONPath-like Syntax](#supported-jsonpath-like-syntax)
  - [General Rules](#general-rules)
  - [Supported Syntax](#supported-syntax)
      - [Root](#root)
      - [Dot notation for property keys](#dot-notation-for-property-keys)
      - [Bracket notation with string keys](#bracket-notation-with-string-keys)
      - [Bracket notation with numeric indices](#bracket-notation-with-numeric-indices)
  - [Unsupported Features](#unsupported-features)
- [Development Scripts](#development-scripts)
- [Grammar (EBNF)](#grammar-ebnf)
- [License](#license)

## Installation

```bash
npm install tiny-json-path
```

  > This package is ESM-first and also includes a UMD build for use directly in
  > browsers via `<script>`.

## Usage

### Via ESM (bundlers like Vite/Webpack)

`import` directly into your application code; your bundler will resolve the ESM
build.

Example JavaScript file that uses tinyJSONPath:

```js
// e.g. src/main.js
import { getTinyJsonPath } from 'tiny-json-path';

async function run() {
  const res = await fetch('https://jsonplaceholder.typicode.com/users');
  const data = await res.json();
  const username = getTinyJsonPath(data, '$[0].username');
  document.querySelector('#out').textContent = username ?? '(not found)';
}
```

Example HTML file (e.g., index.html):

```html
<!doctype html>
<html>
  <body>
    <p id="out">Loading…</p>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

### Via UMD (script tag or CDN)

If you prefer a `<script>` tag (e.g., for a simple page), you can use the UMD
build. You have two ways to get the script:

#### Use a CDN (fastest to try)

The UMD build is hosted on popular CDNs, so you can drop it straight into a
page without installing anything. This is the quickest way to experiment
with tinyJSONPath.

jsDeliver:

```html
<!-- Using jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/tiny-json-path/dist/tiny-json-path.umd.min.js"></script>
```

UNPKG:

```html
<!-- or using UNPKG -->
<script src="https://unpkg.com/tiny-json-path/dist/tiny-json-path.umd.min.js"></script>
```

For production, it’s recommended to pin a specific version instead of relying
on latest:

jsDeliver:

```html
<!-- Pinning version 1.0.0 -->
<script src="https://cdn.jsdelivr.net/npm/tiny-json-path@1.0.0/dist/tiny-json-path.umd.min.js"></script>
```

UNPKG:

```html
<!-- Pinning version 1.0.0 (UNPKG) -->
<script src="https://unpkg.com/tiny-json-path@1.0.0/dist/tiny-json-path.umd.min.js"></script>
```

#### Serve the UMD file you installed via npm

- Copy node_modules/tiny-json-path/dist/tiny-json-path.umd.min.js into your
  app’s public/static folder (or have your bundler copy it during build).
- Reference it with a relative
  `<script src="/path/to/tiny-json-path.umd.min.js"></script>` like this:

```html
<!doctype html>
<html>
  <body>
    <p id="out">Loading…</p>

    <!-- Pin a version in production (replace @latest) -->
    <script src="/path/to/tiny-json-path.umd.min.js"></script>
    <script>
      (async () => {
        const res = await fetch('https://jsonplaceholder.typicode.com/users');
        const data = await res.json();
        const username = window.tinyJsonPath.getTinyJsonPath(data, '$[0].username');
        document.getElementById('out').textContent = username ?? '(not found)';
      })();
    </script>
  </body>
</html>
```

- Access with global `window.tinyJsonPath.getTinyJsonPath(...)` (see above).

### Node.js (ESM only)

In Node.js, only the ESM build is supported. You can import functions directly
from the package.

```js
// examples/node-esm.mjs
import { getTinyJsonPath } from 'tiny-json-path';

async function run() {
  const res = await fetch('https://jsonplaceholder.typicode.com/users');
  const data = await res.json();
  const username = getTinyJsonPath(data, '$[0].username');
  console.log(username);
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
```

Run with:

```bash
node examples/node-esm.mjs
```

#### Requirements
- Node.js 18+ (which includes `fetch` globally):

```js
import { getTinyJsonPath } from 'tiny-json-path';
```

- For Node.js ≤16, install [`node-fetch`](https://www.npmjs.com/package/node-fetch)
  and import it explicitly:

```js
import fetch from 'node-fetch';
import { getTinyJsonPath } from 'tiny-json-path';
```

  > Note: This package does not provide a CommonJS build.
  > `require("tiny-json-path")` is not supported. Use import only.

### Tips

- Serve over HTTP, not file:// (use vite dev, npx http-server, npx serve, etc.)
  to avoid CORS or module loader issues.
- If using CDN, pin CDN versions in production (e.g., @1.0.0) instead of
  relying on @latest.
- Don’t mix ESM and UMD in the same project. If you’re already using a bundler,
  prefer ESM imports. Use UMD only if you need to use directly in browsers via
  plain `<script>` tags.

### API Reference

#### Getter: `getTinyJsonPath(obj, path)`

- Returns the value at the path, or `undefined` if not found.
- Does not create or modify data.
- Stops traversal if:
  - A required object/array is missing (`null`/`undefined`).
  - A segment key or index is invalid.

#### Setter: `setTinyJsonPath(obj, path, value)`

- Assigns the given `value` at the path.
- Returns `true` if successful, or `false` if the path was invalid or
  conflicted with a non-object.
- Creates intermediate structures:
  - If a missing key is followed by an index segment, creates an array.
  - Otherwise, creates an object.
- Expands arrays as needed:
  - Setting `users[5]` when `users` has length 3 will expand it to length 6
    with empty slots.

## Examples

Given:

```js
const obj = {
  users: [
    { name: "Alice" },
    { name: "Bob" }
  ]
};
```

**Get:**

```js
getTinyJsonPath(obj, "$.users[0].name");   // "Alice"
getTinyJsonPath(obj, "$['users'][1]['name']"); // "Bob"
getTinyJsonPath(obj, "$.users[2].name");   // undefined
```

**Set:**

```js
setTinyJsonPath(obj, "$.users[1].name", "Bobby");
// obj.users[1].name === "Bobby"

setTinyJsonPath(obj, "$.users[2].name", "Charlie");
// obj.users[2] is created, obj.users[2].name === "Charlie"

setTinyJsonPath(obj, "$.settings.theme", "dark");
// obj.settings is created as {}, then obj.settings.theme = "dark"
```

## Supported JSONPath-like Syntax

The functions `getTinyJsonPath` and `setTinyJsonPath` implement a **minimal
subset** of JSONPath-style syntax. This subset is intentionally small and
predictable, designed to cover the most common use cases for object/array
traversal.

### General Rules

- All paths must **start with a leading `$`** (root of the object).
- Whitespace is allowed between segments and inside brackets. It is ignored.
- Traversal fails gracefully: if a segment cannot be resolved,
  `getTinyJsonPath` returns `undefined`, and `setTinyJsonPath` returns `false`.

### Supported Syntax

#### Root

- Always begin with:

```
$
```

#### Dot notation for property keys
- Access properties directly after a dot.
- Keys must consist of **letters, numbers, underscores, or dashes**
  (`[A-Za-z0-9_-]`).

Examples:

```
$.user
$.user_name
$.user-name
$.address.street1
```

Notes:
- Whitespace after the dot is ignored: `$. user` is equivalent to `$.user`.
- Empty keys are invalid: `$.` or `$.123` without a proper key will fail.

#### Bracket notation with string keys

- Access string keys by quoting them inside brackets.
- Both **double quotes** and **single quotes** are supported.

Examples:

```
$["user"]
$['user']
$["user-name"]
$["complex key with spaces"]
```

Notes:
- Closing quote and closing bracket are required.
- If the current value is `null`/`undefined`, traversal stops.

#### Bracket notation with numeric indices

- Access array elements by their numeric index inside brackets.

Examples:

```
$[0]
$.users[2]
$["groups"][10]
```

Notes:
- Only non-negative integers are valid.
- If the current value is not an array, resolution fails.
- For `setTinyJsonPath`, missing array elements will be created, expanding the
  array with `undefined` placeholders.

### Unsupported Features

This implementation does **not** support the full JSONPath standard.
The following are **not implemented**:

- Wildcards (`*`)
- Recursive descent (`..`)
- Filters (`[?()]`)
- Slices (`[0:2]`)
- Unions (`[0,1]`)
- Script expressions or functions

Only the minimal subset documented above is recognized.

## Development Scripts

The following npm scripts are primarily for contributors or anyone who wants to
build and test the library locally. They are not required for using
`tiny-json-path` as a dependency in your project.

### `npm run build`

Builds the library using **Vite**. Generates the ESM and UMD bundles in the
`dist/` directory. Use this before publishing or testing distribution files.

### `npm run build:min`

Runs **Terser** on both the UMD and ESM bundles, producing minified `.min.js`
versions. This ensures your library can be loaded efficiently in production
(smaller payloads for browsers and CDNs).

### `npm run test`

Runs the unit test suite once using **Vitest**. This is CI-friendly — the
command exits with a non-zero status if any test fails.

The tests cover:
- Basic getters (`$.a`, `$.a.b.c`)
- Array indexing (`$[0].x`, `$[1][2]`)
- Quoted and dashed keys (`$["weird key"]`, `$.some-key`)
- Whitespace tolerance (`$ . users [ 1 ] . name`)
- Edge cases (invalid paths, missing `$`, out-of-bounds indices)
- Setters that create nested objects/arrays, expand arrays, or fail gracefully
- Round-trips (set + get) to verify correctness

Use this to confirm the library behaves as expected before publishing.

### `npm run test:watch`

Starts **Vitest** in watch mode. Re-runs tests automatically when you change
source or test files.

This is ideal for:
- Test-driven development (TDD)
- Quickly checking fixes while editing code
- Iterating on edge cases without manually re-running tests

### `npm run serve:examples`
Serves the repository root (including `examples/`) at
[http://localhost:9000](http://localhost:9000) using **http-server**.

This is useful if you want to try the UMD build in a browser page without
bundlers.

  > Note: `http-server` is intentionally **not** a devDependency.
  > Install it globally instead (`npm install -g http-server`) so it doesn’t
  > bloat the package.

### Grammar (EBNF)

  > If you only care about usage, you can skip this section — it’s here for
  > those who want the exact grammar definition.

The path syntax supported by **tiny-json-path** is a small, predictable subset
of JSONPath. To make the rules precise, the following grammar is written in
**Extended Backus–Naur Form (EBNF)**, a common notation for formally describing
programming languages and data formats.

If you haven’t seen EBNF before: it’s like a blueprint for strings.
- Terminals (literal characters) are written in quotes.
- Non-terminals are named productions defined in terms of other productions.
- `{ … }` means “zero or more repetitions.”
- `[ … ]` means “optional.”

This grammar specifies exactly what strings are considered valid paths for
`getTinyJsonPath` and `setTinyJsonPath`. It does not cover runtime semantics
(like how missing arrays are created in setters), only the syntax that the
functions will recognize.

```
(* tiny-json-path: EBNF for supported JSONPath-like subset *)

Path            = Root , { WS } , Segments ;
Root            = "$" ;

Segments        = { Segment } ;
Segment         = { WS } , ( DotSegment | BracketSegment ) ;

(* $.key  — letters/digits/underscore/dash only *)
DotSegment      = "." , { WS } , Key ;
Key             = KeyChar , { KeyChar } ;
KeyChar         = Letter | Digit | "_" | "-" ;

(* $["foo"]  or  $['foo'] *)
BracketSegment  = "[" , { WS } , ( QuotedKey | Index ) , { WS } , "]" ;

QuotedKey       = DQString | SQString ;
DQString        = DQuote , { DQChar } , DQuote ;
SQString        = SQuote , { SQChar } , SQuote ;

(* $[0] — non-negative decimal integer *)
Index           = Digit , { Digit } ;

(* Lexical sets *)
DQChar          = ? any character except " and line terminators ? ;
SQChar          = ? any character except ' and line terminators ? ;

Letter          = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J"
                | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T"
                | "U" | "V" | "W" | "X" | "Y" | "Z"
                | "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j"
                | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t"
                | "u" | "v" | "w" | "x" | "y" | "z" ;

Digit           = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" ;

DQuote          = '"' ;
SQuote          = "'" ;

(* Whitespace: JS /\s/ — spaces, tabs, newlines, etc. *)
WS              = ? any Unicode whitespace character ? ;
```

## License

MIT
