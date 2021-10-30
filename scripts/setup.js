const { spawnSync } = require("child_process");
const { readdirSync } = require("fs");
const path = require("path");

const clock = process.argv[2] || "";

if (!clock.trim()) {
  console.log("You must specify a clock");
  process.exit(1);
}

function setupClock(clock) {
  spawnSync("npm", ["ci"], { stdio: "inherit", cwd: path.join("clocks", clock) });
}

if (clock === "all") {
  const clocks = readdirSync("clocks");
  for (const clock of clocks) {
    setupClock(clock);
  }
} else {
  setupClock(clock);
}
