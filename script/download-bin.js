#!/usr/bin/env node

const { default: fetch } = require("node-fetch");
const fs = require("fs");
const path = require("path");

async function download(url, path) {
  console.log(url);
  const res = await fetch(url);
  await new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(path);
    res.body.pipe(fileStream);
    res.body.on("error", (err) => {
      reject(err);
    });
    fileStream.on("finish", function () {
      resolve();
    });
  });
}

(async () => {
  const latest = await fetch(
    "https://api.github.com/repos/baranwang/gse-cmd/releases/latest"
  ).then((res) => res.json());
  const binList = {
    darwin_arm64: "darwin-arm64",
    darwin_amd64: "darwin-x64",
    linux_arm64: "linux-arm64",
    linux_amd64: "linux-x64",
    linux_386: "linux-x32",
    windows_arm64: "win32-arm64.exe",
    windows_amd64: "win32-x64.exe",
    windows_386: "win32-x32.exe",
  };
  for (let key in binList) {
    const url = latest.assets.find((item) =>
      item.name.includes(key)
    ).browser_download_url;
    await download(url, path.resolve("bin", `gse-cmd-${binList[key]}`));
  }
})();
