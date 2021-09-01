module.exports = (config) => {
  config.addGlobalData("timestamp", Date.now());
  config.addGlobalData("common_css", `
  `);
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
