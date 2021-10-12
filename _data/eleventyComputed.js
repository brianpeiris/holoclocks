const { lstatSync, readdirSync } = require("fs");
const { basename, dirname, join } = require("path");

module.exports = {
  bundle: (data) => {
    if (data.page.inputPath.includes("clocks")) {
      const dir = dirname(data.page.inputPath);
      return readdirSync(dir).find(f => f.match("^bundle-.+\.js$"))
    }
    else {
      return null;
    }
  },
  layout: (data) => {
    if (data.page.inputPath.includes("clocks")) return "clock.mustache";
    else return null;
  },
  title: (data) => basename(dirname(data.page.inputPath)),
};
