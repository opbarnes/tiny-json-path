# tiny-json-path — Node ESM example

## Goal
Run a Node.js ESM script that fetches
[https://jsonplaceholder.typicode.com/users](),
extracts the value at JSON path `$[0].username` using **tiny-json-path**,
and prints it.

## Requirements
- **Node.js 18+** (has `fetch` built-in).
  Check:
~~~
node -v
~~~
- This library is **ESM-only** (no CJS `require()` build). Use `import …` or
dynamic `import()`.

## Files
Create `examples/node-esm/node-esm.mjs` with one of the following versions.

**A) Using the local build (running from the repo, before publish):**

~~~
import { getTinyJsonPath } from "../../dist/tiny-json-path.es.js";

const run = async () => {
  const res = await fetch("https://jsonplaceholder.typicode.com/users");
  const data = await res.json();
  const username = getTinyJsonPath(data, "$[0].username");
  console.log(username);
};

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
~~~

**B) Using the package name (after publishing to npm):**

~~~
import { getTinyJsonPath } from "tiny-json-path";

const run = async () => {
  const res = await fetch("https://jsonplaceholder.typicode.com/users");
  const data = await res.json();
  const username = getTinyJsonPath(data, "$[0].username");
  console.log(username);
};

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
~~~

## Run
From the project root:

~~~
node examples/node-esm/node-esm.mjs
~~~

Expected output (example):
~~~
Bret
~~~

## Older Node (≤16)
Node ≤16 doesn’t have `fetch`. You can still run the example with `node-fetch`:

1) Install without saving (library projects typically don’t commit a lockfile):

~~~
npm install node-fetch --no-save
~~~

2) Use this script instead:

~~~
import fetch from "node-fetch";
import { getTinyJsonPath } from "../../dist/tiny-json-path.es.js"; // or "tiny-json-path" after publish

const run = async () => {
  const res = await fetch("https://jsonplaceholder.typicode.com/users");
  const data = await res.json();
  const username = getTinyJsonPath(data, "$[0].username");
  console.log(username);
};

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
~~~

## Notes & Rationale
- This project ships **ESM** and **UMD** builds. There is **no CJS** build.
  - Node/bundlers: import the ESM entry.
  - Browsers without bundlers: load the UMD file via `<script>` (exposes a
    global).
- The path `$[0].username` is supported by your `getTinyJsonPath`
  implementation (array index selector + dot/property access).
- If you reorganize examples under subfolders (e.g., `examples/esm-basic/` vs
  `examples/node-esm/`), keep the relative import to
  `dist/tiny-json-path.es.js` correct when running from the repo.