#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const makeWords = () => {
  const words = fs.readFileSync(
    path.resolve("src/data/pinyin-data/zdic.txt"),
    "utf8"
  );
  const result = {};
  words.split("\n").forEach((item) => {
    if (new RegExp("^#").test(item)) return;
    const [, pinyin, word] = item.split(new RegExp("[:#]"));
    if (pinyin && word) {
      const key = pinyin.trim();
      const value = word.trim();
      result[key] = [...(result[key] || []), value];
    }
  });
  fs.writeFileSync(
    path.resolve("src/data/words.json"),
    JSON.stringify(result),
    "utf8"
  );
};

const makePhrase = () => {
  const phrases = fs.readFileSync(
    path.resolve("src/data/phrase-pinyin-data/large_pinyin.txt"),
    "utf8"
  );
  const result = {};
  phrases.split("\n").forEach((item) => {
    if (item.startsWith("#")) return;
    const [word, pinyin] = item.split(":");
    if (pinyin && word) {
      const key = pinyin.trim();
      const value = word.trim();
      result[key] = [...(result[key] || []), value];
    }
  });
  fs.writeFileSync(
    path.resolve("src/data/phrases.json"),
    JSON.stringify(result),
    "utf8"
  );
};

const makeDict = () => {
  const readFileList = (dir) => {
    const files = fs.readdirSync(dir);
    const result = [];
    files.forEach((item) => {
      const filePath = path.join(dir, item);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        result.push(...readFileList(filePath));
      } else {
        result.push(filePath);
      }
    });
    return result;
  };
  const dictList = readFileList("node_modules/segment-dict/dict/segment");

  const dict = dictList
    .flatMap((item) =>
      fs
        .readFileSync(item, "utf8")
        .split("\n")
        .filter((item) => item.trim())
    )
    .reduce((dict, raw) => {
      const [word, pos, weight] = raw.split("|");
      if (
        dict[word] &&
        dict[word].raw !== raw &&
        parseInt(dict[word].weight) !== 0
      ) {
        return dict;
      }
      dict[word] = { word, pos, weight, raw };
      return dict;
    }, {});

  const phrases = fs
    .readFileSync(
      path.resolve("src/data/phrase-pinyin-data/large_pinyin.txt"),
      "utf8"
    )
    .split("\n")
    .filter((item) => !item.startsWith("#") && item.trim())
    .map((item) => item.split(":")[0].trim())
    .filter((item) => item);

  const result = phrases.map((phrase) => {
    const data = dict[phrase];
    if (data) {
      return data.raw;
    } else {
      return `${phrase}|0x0|0`;
    }
  });

  fs.writeFileSync(
    path.resolve("src/data/dict.txt"),
    result.sort().join("\n"),
    "utf8"
  );
};

(() => {
  makeWords();
  makePhrase();
  makeDict();
})();
