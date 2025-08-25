// Requires Node 18+ (global fetch). If older, `npm i node-fetch` and import it.
import { getTinyJsonPath, setTinyJsonPath } from "../../dist/tiny-json-path.es.js";

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