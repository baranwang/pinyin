#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const makeWords = () => {
  const words = fs.readFileSync(
    path.resolve("src/data/pinyin-data/pinyin.txt"),
    "utf8"
  );
  const reslut = {};
  words.split("\n").forEach((item) => {
    if (new RegExp("^#").test(item)) return;
    const [, pinyin, word] = item.split(new RegExp("[:#]"));
    if (pinyin && word) {
      const key = pinyin.trim();
      const value = word.trim();
      reslut[key] = [...(reslut[key] || []), value];
    }
  });
  fs.writeFileSync(
    path.resolve("src/data/words.json"),
    JSON.stringify(reslut),
    "utf8"
  );
};

const makePhrase = () => {
  const phrases = fs.readFileSync(
    path.resolve("src/data/phrase-pinyin-data/pinyin.txt"),
    "utf8"
  );
  const reslut = {};
  phrases.split("\n").forEach((item) => {
    if (new RegExp("^#").test(item)) return;
    const [word, pinyin] = item.split(new RegExp(":"));
    if (pinyin && word) {
      const key = pinyin.trim();
      const value = word.trim();
      reslut[key] = [...(reslut[key] || []), value];
    }
  });
  fs.writeFileSync(
    path.resolve("src/data/phrases.json"),
    JSON.stringify(reslut),
    "utf8"
  );
};

(() => {
  makeWords();
  makePhrase();
})();
