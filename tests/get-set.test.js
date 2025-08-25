// get-set.test.mjs (ESM; fine to keep .mjs)
import { test, expect } from 'vitest';

// If your ESM build re-exports named functions:
import { getTinyJsonPath, setTinyJsonPath } from '../dist/tiny-json-path.es.js';
// If not, uncomment this fallback:
// import * as TJP from '../dist/tiny-json-path.es.js';
// const { getTinyJsonPath, setTinyJsonPath } = TJP;

const clone = (x) => (x === undefined ? undefined : JSON.parse(JSON.stringify(x)));

test('get: dot path depth 1', () => {
  const obj = { a: 1 };
  expect(getTinyJsonPath(obj, '$.a')).toBe(1);
});

test('get: nested dot path depth 3', () => {
  const obj = { a: { b: { c: 42 } } };
  expect(getTinyJsonPath(obj, '$.a.b.c')).toBe(42);
});

test('get: root array index + key', () => {
  const obj = [{ x: 'ok' }, { x: 'yes' }];
  expect(getTinyJsonPath(obj, '$[1].x')).toBe('yes');
});

test('get: array of arrays', () => {
  const obj = [[10, 20], [30, 40]];
  expect(getTinyJsonPath(obj, '$[1][0]')).toBe(30);
});

test('get: mixed object/array depth', () => {
  const obj = { a: [{ b: 7 }, { b: 9 }] };
  expect(getTinyJsonPath(obj, '$.a[1].b')).toBe(9);
});

test('get: quoted key ["weird key"]', () => {
  const obj = { 'weird key': 123 };
  expect(getTinyJsonPath(obj, '$["weird key"]')).toBe(123);
});

// Escaping is not presently supported.
test("get: single-quoted with escaped quote returns undefined (by design)", () => {
  const obj = { "o'clock": 'twelve' };
  expect(getTinyJsonPath(obj, "$['o\\'clock']")).toBeUndefined();
});

test('get: dash in dot segment', () => {
  const obj = { 'some-key': 88 };
  expect(getTinyJsonPath(obj, '$.some-key')).toBe(88);
});

test('get: whitespace tolerant', () => {
  const obj = { users: [{ name: 'A' }, { name: 'B' }] };
  expect(getTinyJsonPath(obj, '$  .  users  [ 1 ]  .  name  ')).toBe('B');
});

// Edge cases
test('get: missing leading $ => undefined', () => {
  expect(getTinyJsonPath({ a: 1 }, 'a.b')).toBeUndefined();
});

test('get: non-existent path => undefined', () => {
  expect(getTinyJsonPath({ a: {} }, '$.a.b.c')).toBeUndefined();
});

test('get: numeric index on non-array => undefined', () => {
  expect(getTinyJsonPath({ a: 1 }, '$.a[0]')).toBeUndefined();
});

// Out-of-bounds test
test('get: OOB index => undefined', () => {
  expect(getTinyJsonPath([1,2,3], '$[9]')).toBeUndefined();
});

test('get: empty key after dot => undefined', () => {
  expect(getTinyJsonPath({ a: 1 }, '$.')).toBeUndefined();
});

// SET happy paths
test('set: create nested objects with dots', () => {
  const obj = {};
  expect(setTinyJsonPath(obj, '$.a.b.c', 42)).toBe(true);
  expect(obj).toEqual({ a: { b: { c: 42 } } });
});

test('set: obj -> array index -> obj', () => {
  const obj = {};
  expect(setTinyJsonPath(obj, '$.a[0].b', 'ok')).toBe(true);
  expect(obj).toEqual({ a: [{ b: 'ok' }] });
});

test('set: array expansion with holes', () => {
  const obj = { a: [] };
  expect(setTinyJsonPath(obj, '$.a[3]', 9)).toBe(true);
  expect(obj.a.length).toBe(4);
  expect(obj.a[3]).toBe(9);
});

test('set: quoted key at root', () => {
  const obj = {};
  expect(setTinyJsonPath(obj, '$["weird key"]', 7)).toBe(true);
  expect(obj['weird key']).toBe(7);
});

test('set: dash key in dot segment', () => {
  const obj = {};
  expect(setTinyJsonPath(obj, '$.some-key.here', 1)).toBe(true);
  expect(obj['some-key'].here).toBe(1);
});

test('set: mixed nesting + whitespace', () => {
  const obj = {};
  expect(setTinyJsonPath(obj, '$  .  users  [ 2 ]  .  name  ', 'Zed')).toBe(true);
  // Be explicit to avoid sparse-array deep-equality quirks:
  expect(Array.isArray(obj.users)).toBe(true);
  expect(obj.users.length).toBe(3);
  expect(obj.users[0]).toBeUndefined();
  expect(obj.users[1]).toBeUndefined();
  expect(obj.users[2]).toEqual({ name: 'Zed' });
});

// SET conflict cases
test('set: index on non-array fails', () => {
  const obj = { a: 1 };
  const before = clone(obj);
  expect(setTinyJsonPath(obj, '$.a[0]', 'x')).toBe(false);
  expect(obj).toEqual(before);
});

test('set: traverse through non-object fails', () => {
  const obj = { a: 5 };
  const before = clone(obj);
  expect(setTinyJsonPath(obj, '$.a.b', 1)).toBe(false);
  expect(obj).toEqual(before);
});

test('set: invalid path (no $) fails', () => {
  const obj = {};
  const before = clone(obj);
  expect(setTinyJsonPath(obj, 'a.b', 1)).toBe(false);
  expect(obj).toEqual(before);
});

test('set: last seg index but current not array fails', () => {
  const obj = { a: {} };
  const before = clone(obj);
  expect(setTinyJsonPath(obj, '$.a[0]', 1)).toBe(false);
  expect(obj).toEqual(before);
});

test('set: empty key after dot fails', () => {
  const obj = {};
  const before = clone(obj);
  expect(setTinyJsonPath(obj, '$.')).toBe(false);
  expect(obj).toEqual(before);
});

test('set: non-numeric index fails', () => {
  const obj = {};
  const before = clone(obj);
  expect(setTinyJsonPath(obj, '$[abc]', 1)).toBe(false);
  expect(obj).toEqual(before);
});

// Round-trips
test('round-trip: object chain', () => {
  const obj = {};
  expect(setTinyJsonPath(obj, '$.x.y.z', 77)).toBe(true);
  expect(getTinyJsonPath(obj, '$.x.y.z')).toBe(77);
});

test('round-trip: array inside object', () => {
  const obj = {};
  expect(setTinyJsonPath(obj, '$.list[1].name', 'Joe')).toBe(true);
  expect(getTinyJsonPath(obj, '$.list[1].name')).toBe('Joe');
});

test('round-trip: quoted root key', () => {
  const obj = {};
  expect(setTinyJsonPath(obj, '$[" root key "]', 5)).toBe(true);
  expect(getTinyJsonPath(obj, '$[" root key "]')).toBe(5);
});

test('round-trip: dashed keys via dot and bracket', () => {
  const obj = {};
  expect(setTinyJsonPath(obj, '$.k-1.k-2', 'ok')).toBe(true);
  expect(getTinyJsonPath(obj, '$.k-1.k-2')).toBe('ok');
  expect(getTinyJsonPath(obj, '$["k-1"]["k-2"]')).toBe('ok');
});

// Extra coverage you asked for:
test('get: AoA deep', () => {
  const obj = [[0, [1,2,3]], [10, [20, 30, [40, 50]]]];
  expect(getTinyJsonPath(obj, '$[1][1][2][1]')).toBe(50);
});

test('get: .prop.prop.prop[index]', () => {
  const obj = { a: { b: { c: [9, 8, 7] } } };
  expect(getTinyJsonPath(obj, '$.a.b.c[2]')).toBe(7);
});

// Dual SET tests: start with [] and with {}
test('set (start []): array index inside array index -> value', () => {
  const obj = [];
  expect(setTinyJsonPath(obj, '$[1][2]', 'X')).toBe(true);
  expect(obj[1][2]).toBe('X');
});

test('set (start {}): create array->array chain', () => {
  const obj = {};
  expect(setTinyJsonPath(obj, '$.a[1][2]', 99)).toBe(true);
  expect(obj.a[1][2]).toBe(99);
});

// Object-inside-array (both starts)
test('set (start []): object inside array', () => {
  const obj = [];
  expect(setTinyJsonPath(obj, '$[0].user.name', 'Zoe')).toBe(true);
  expect(obj[0].user.name).toBe('Zoe');
});

test('set (start {}): object inside array', () => {
  const obj = {};
  expect(setTinyJsonPath(obj, '$.list[0].user.name', 'Yan')).toBe(true);
  expect(obj.list[0].user.name).toBe('Yan');
});

// Ensure expanding array doesn’t clobber existing data
test('set: array growth preserves earlier indices', () => {
  const obj = { a: ['x'] };
  expect(setTinyJsonPath(obj, '$.a[3]', 'y')).toBe(true);
  expect(obj.a[0]).toBe('x');
  expect(obj.a[3]).toBe('y');
});