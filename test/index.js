const { Pinyin } = require("../dist");

const pinyin = new Pinyin();

(async () => {
  console.log(await pinyin.get("这是一个基于Node.js的中文拼音模块。"));
})();
