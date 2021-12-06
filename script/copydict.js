const fs = require("fs-extra");
const path = require("path");

(() => {
  const dictPath = path.resolve(__dirname, "../node_modules/segment-dict/dict");
  fs.copySync(dictPath, path.resolve(__dirname, "..", "dist", "dict"), {
    overwrite: true,
  });
})();
