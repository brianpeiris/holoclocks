const concurrently = require("concurrently");
const path = require("path");

const clock = process.argv[2] || "";

if (!clock) {
  console.log("You must specify a clock");
  process.exit(1);
}

concurrently([{ command: "eleventy --serve" }, { command: "npm run start", cwd: path.join("clocks", clock) }]);
