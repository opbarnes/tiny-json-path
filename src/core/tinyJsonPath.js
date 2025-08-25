/**
 * Retrieve a value from an object using a minimal JSONPath subset.
 *
 * Supported syntax:
 * - Leading "$"
 * - Dot segments with [A-Za-z0-9_-]
 * - Bracketed string keys: ["foo"] or ['foo']
 * - Bracketed numeric indices: [0]
 *
 * @param {object} obj - The root object to query.
 * @param {string} path - JSONPath string (must start with "$").
 * @returns {*} The value at the specified path, or `undefined` if not found.
 */
export function getTinyJsonPath(obj, path) {
  if (!path || path[0] !== '$') {
    return undefined;
  }

  let i = 1;
  let cur = obj;
  const eatWs = () => { while (/\s/.test(path[i])) i++; };

  while (i < path.length) {
    eatWs();
    if (path[i] === '.') {
      i++; // dot
      eatWs(); // ← allow spaces after the dot
      let start = i;
      while (i < path.length && /[A-Za-z0-9_\-]/.test(path[i])) {
        i++;
      }

      const key = path.slice(start, i);
      if (!key) {
        return undefined;
      }

      if (cur == null) {
        return undefined;
      }

      cur = cur[key];
      continue;
    }

    if (path[i] === '[') {
      i++;
      eatWs();
      if (path[i] === '"' || path[i] === "'") {
        const q = path[i++];
        let s = "";
        while (i < path.length && path[i] !== q) {
          s += path[i++];
        }
        if (path[i] !== q) {
          return undefined;
        }

        i++;
        eatWs();
        if (path[i] !== ']') {
          return undefined;
        }
        i++;
        if (cur == null) {
          return undefined;
        }
        cur = cur[s];
        continue;
      } else {
        let start = i;
        while (i < path.length && /[0-9]/.test(path[i])) {
          i++;
        }
        const idx = parseInt(path.slice(start,i), 10);
        eatWs();
        if (path[i] !== ']' || !Number.isFinite(idx)) {
          return undefined;
        }

        i++;
        if (!Array.isArray(cur)) {
          return undefined;
        }

        cur = cur[idx];
        continue;
      }
    }
    if (/\s/.test(path[i])) {
      i++;
      continue;
    }
    break;
  }
  return cur;
}

/**
 * Set a value in an object using a minimal JSONPath subset.
 *
 * Creates intermediate objects/arrays as needed.
 *
 * Supported syntax:
 * - Leading "$"
 * - Dot segments with [A-Za-z0-9_-]
 * - Bracketed string keys: ["foo"] or ['foo']
 * - Bracketed numeric indices: [0]
 *
 * @param {object} obj - The root object to modify.
 * @param {string} path - JSONPath string (must start with "$").
 * @param {*} value - The value to assign at the path.
 * @returns {boolean} `true` if the value was set successfully,
 *   `false` if the path was invalid or conflicted with a non-object.
 */
export function setTinyJsonPath(obj, path, value) {
  if (!path || path[0] !== '$') {
    return false;
  }

  // First pass: tokenize to the same segment shapes your getter expects.
  const segs = [];
  let i = 1;
  const eatWs = () => { while (/\s/.test(path[i])) i++; };

  while (i < path.length) {
    eatWs();
    if (path[i] === '.') {
      i++; // dot
      eatWs(); // ← allow spaces after the dot
      let start = i;
      while (i < path.length && /[A-Za-z0-9_\-]/.test(path[i])) {
        i++;
      }

      const key = path.slice(start, i);
      if (!key) {
        return false;
      }

      segs.push({ type: 'key', key });
      continue;
    }

    if (path[i] === '[') {
      i++;
      eatWs();
      if (path[i] === '"' || path[i] === "'") {
        const q = path[i++];
        let s = "";
        while (i < path.length && path[i] !== q) {
          s += path[i++];
        }
        if (path[i] !== q) {
          return false;
        }
        i++;
        eatWs();
        if (path[i] !== ']') {
          return false;
        }
        i++;
        segs.push({ type: 'key', key: s });
        continue;
      } else {
        let start = i;
        while (i < path.length && /[0-9]/.test(path[i])) {
          i++;
        }
        const idx = parseInt(path.slice(start, i), 10);
        eatWs();
        if (path[i] !== ']' || !Number.isFinite(idx)) {
          return false;
        }
        i++;
        segs.push({ type: 'index', index: idx });
        continue;
      }
    }
    if (/\s/.test(path[i])) {
      i++;
      continue;
    }
    break;
  }

  if (segs.length === 0) {
    return false;
  }

  // Second pass: walk/create and assign.
  let cur = obj;
  for (let s = 0; s < segs.length - 1; s++) {
    const seg = segs[s];
    const next = segs[s + 1];

    if (seg.type === 'key') {
      if (cur[seg.key] == null) {
        cur[seg.key] = (next.type === 'index') ? [] : {};
      } else if (typeof cur[seg.key] !== 'object') {
        return false;
      }
      cur = cur[seg.key];
    } else { // index
      if (!Array.isArray(cur)) {
        return false;
      }
      const idx = seg.index;
      if (idx < 0) {
        return false;
      }
      if (cur[idx] == null) {
        cur[idx] = (next.type === 'index') ? [] : {};
      } else if (typeof cur[idx] !== 'object') {
        return false;
      }
      cur = cur[idx];
    }
  }

  // Final segment assignment
  const last = segs[segs.length - 1];
  if (last.type === 'key') {
    if (cur == null || typeof cur !== 'object') {
      return false;
    }
    cur[last.key] = value;
    return true;
  } else {
    if (!Array.isArray(cur)) {
      return false;
    }
    const idx = last.index;
    if (idx < 0) {
      return false;
    }
    if (idx >= cur.length) {
      cur.length = idx + 1; // expand with empty slots
    }
    cur[idx] = value;
    return true;
  }
}
