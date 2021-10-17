module.exports = (config) => {
  config.setBrowserSyncConfig({
    files: ["./clocks/**"],
  });
  config.addWatchTarget("./clocks/*/bundle*");
  config.addWatchTarget("./clocks/*/*.mustache");
  config.addWatchTarget("./_includes/*.mustache");
  return {
    jsDataFileSuffix: ".data",
    templateFormats: ["mustache"],
    dir: {
      input: ".",
      output: ".",
    },
  };
};
