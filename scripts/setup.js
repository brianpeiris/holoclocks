const { spawnSync } = require("child_process");
const path = require("path");

const clock = process.argv[2] || "";

if (!clock.trim()) {
  console.log("You must specify a clock");
  process.exit(1);
}

spawnSync("npm", ["ci"], { stdio: "inherit", cwd: path.join("clocks", clock) });
