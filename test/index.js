const { Pinyin } = require("../dist");

const pinyin = new Pinyin();

(async () => {
  console.log(await pinyin.get("测试"));
})();
