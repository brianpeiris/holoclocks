module.exports = (config) => {
  config.setBrowserSyncConfig({
    files: ["./clocks/**"],
  });
  return {
    jsDataFileSuffix: ".data",
    templateFormats: ["mustache"],
    dir: {
      input: ".",
      output: ".",
    },
  };
};
