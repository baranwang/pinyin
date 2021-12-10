const esbuild = require("esbuild");
const { builtinModules } = require("node:module");
const { dependencies } = require("../package.json");

esbuild
  .build({
    entryPoints: [
      "./src/index.ts",
    ],
    outdir: "./dist",
    watch: process.env.NODE_ENV !== "production",
    minify: process.env.NODE_ENV === "production",
    bundle: true,
    platform: "node",
    format: "cjs",
    external: [...builtinModules, ...Object.keys(dependencies)],
    loader: {
      '.json': 'file',
      ".txt": "file",
    },
  })
  .catch(() => process.exit(1));
