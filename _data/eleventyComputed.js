const { lstatSync, readdirSync } = require("fs");
const { basename, dirname, join } = require("path");

module.exports = {
  bundle: (data) => {
    if (data.page.inputPath.includes("clocks")) {
      const dir = dirname(data.page.inputPath);
      const bundles = readdirSync(dir)
        .filter((f) => f.match("^bundle-.+.js$"))
        .map((b) => [b, lstatSync(join(dir, b)).ctime]);
      bundles.sort((a, b) => a[1] - b[1]);
      return bundles[bundles.length - 1][0];
    } else {
      return null;
    }
  },
  layout: (data) => {
    if (data.page.inputPath.includes("clocks")) {
      return "clock.mustache";
    }
    else {
      return null;
    }
  },
  title: (data) => basename(dirname(data.page.inputPath)),
};
