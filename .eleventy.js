module.exports = (config) => {
  config.setBrowserSyncConfig({
    files: ["./clocks/**"],
  });
  config.addWatchTarget("./clocks/*/bundle*");
  return {
    jsDataFileSuffix: ".data",
    templateFormats: ["mustache"],
    dir: {
      input: ".",
      output: ".",
    },
  };
};
