const { spawnSync } = require("child_process");
const path = require("path");

const checkDiff = () => {
  return new Promise((resolve, reject) => {
    const { status } = spawnSync(
      "git",
      ["diff-index", "--quiet", "HEAD", "--"],
      {
        stdio: "inherit",
      }
    );
    resolve(status !== 0);
  });
};

const updateNpm = async (name) => {
  spawnSync("npm", ["i", `${name}@latest`], { stdio: "inherit" });
  const diff = await checkDiff();
  if (!diff) return;
  spawnSync("git", ["add", "-A"], { stdio: "inherit" });
  const { version } = require(path.resolve(
    process.cwd(),
    "node_modules",
    name,
    "package.json"
  ));
  spawnSync(
    "git",
    ["commit", "-m", `build: update pakcage [${name}] to ${version}`],
    { stdio: "inherit" }
  );
};

(async () => {
  await updateNpm("novel-segment");

  const { stdout } = spawnSync("git", ["cherry", "-v"]);
  if (stdout.length) {
    spawnSync("npm", ["version", "patch"], { stdio: "inherit" });
    spawnSync("git", ["push", "--follow-tags"], {
      stdio: "inherit",
    });
  }
})();
