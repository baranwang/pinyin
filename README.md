# Pinyin

[![](https://img.shields.io/npm/v/@baranwang/pinyin)](https://www.npmjs.com/package/@baranwang/pinyin)
[![Node.js Package](https://github.com/baranwang/pinyin/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/baranwang/pinyin/actions/workflows/npm-publish.yml)
![](https://img.shields.io/npm/l/@baranwang/pinyin)

Node.js 汉字转拼音，支持多音字，自动分词

## 安装

```shell
npm i @baranwang/pinyin
# or
yarn add @baranwang/pinyin
# or
pnpm add @baranwang/pinyin
```

## 使用

```javascript
const { Pinyin } = require("@baranwang/pinyin");

const pinyin = new Pinyin();

pinyin.get("你好"); // [["nǐ hǎo"]]
```

## 词典来源

[mozillazg/pinyin-data](https://github.com/mozillazg/pinyin-data.git)

[mozillazg/phrase-pinyin-data](https://github.com/mozillazg/phrase-pinyin-data.git)
