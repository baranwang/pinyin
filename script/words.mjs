import { load } from "cheerio";
import fetch from "node-fetch";
import PQueue from "p-queue";
import { URL } from "url";
import { createWriteStream, readFileSync, writeFileSync } from "fs";
import { ZDIC_URL, concurrency, formatData } from "./utils.mjs";

const getBsList = async () => {
  const res = await fetch(new URL("/zd/bs/", ZDIC_URL));
  const html = await res.text();
  const $ = load(html);
  return $(".pck")
    .map((_, item) => $(item).text())
    .get();
};

const getHansListByBs = async (bs) => {
  const getHansList = async (page = 1) => {
    const res = await fetch(new URL(`/zd/bs/bs/?bs=${bs}|${page}`, ZDIC_URL));
    const html = await res.text();
    const $ = load(html);
    return {
      hans: $("li a")
        .map((_, item) => $(item).attr("href"))
        .get(),
      html: $,
    };
  };

  const { hans, html } = await getHansList();

  if (html(".Pages").length > 0) {
    const paginate = Array.from(
      new Set(
        html(".Pages")
          .find("a.pck")
          .map((_, item) => html(item).attr("title"))
          .get()
          .map((item) => parseInt(item.split("|")[1]))
      )
    );
    const moreHans = await Promise.all(
      paginate.map(async (page) => {
        const { hans } = await getHansList(page);
        return hans;
      })
    );
    return [...hans, ...moreHans.flat()];
  }
  return hans;
};

const getHansData = async (url) => {
  const res = await fetch(new URL(url, ZDIC_URL));
  const html = await res.text();
  const $ = load(html);
  const pinyin = $("[data-type-block='基本解释'] .dicpy")
    .map((_, item) => {
      $(item).find(".ptr").remove();
      const [py] = $(item).text().split(" ");
      return py.trim();
    })
    .get();
  if (pinyin.length === 0) {
    return { html: html, pinyin: [] };
  }
  return { pinyin };
};

const hanlderUnkown = async (unknownTxt, hans, html) => {
  const $ = load(html);
  const ytz = $(".entry_title .z_ytz2").find("a");
  if (ytz.length === 1) {
    return await getHansData(ytz.attr("href"));
  } else {
    console.log(hans, ytz.length);
    unknownTxt.write(`${hans}\n`);
    return { pinyin: [] };
  }
};

const getWords = async () => {
  const queue = new PQueue({ concurrency });
  const unknownList = {};
  const wordsFilePath = "src/data/words.txt";
  const words = createWriteStream(wordsFilePath);
  const ytzTxtFilePath = "src/data/ytz.txt";
  const ytzTxt = createWriteStream(ytzTxtFilePath);
  const unknownTxtFilePath = "src/data/unknown.txt";
  const unknownTxt = createWriteStream(unknownTxtFilePath);
  const bsList = await getBsList();

  bsList.forEach((bs) => {
    queue.add(
      async () => {
        const hansList = await getHansListByBs(bs);
        hansList.forEach(async (hans) => {
          await queue.add(
            async () => {
              const { html, pinyin } = await getHansData(hans);
              const hansText = hans.split("/").pop();
              if (pinyin.length > 0) {
                words.write(`${hansText}:${pinyin.join(",")}\n`);
                console.log("汉字", hansText, pinyin.join(","));
                console.count();
              } else {
                unknownList[hansText] = html;
              }
            },
            { priority: 1 }
          );
        });
      },
      { priority: 0 }
    );
  });

  Object.keys(unknownList).forEach((unknown) => {
    queue.add(async () => {
      const { pinyin } = await hanlderUnkown(
        unknownTxt,
        unknown,
        unknownList[unknown]
      );
      if (pinyin.length === 0) return;
      ytzTxt.write(`${unknown}:${pinyin.join(",")}\n`);
    });
  });

  queue.on("completed", () => {
    writeFileSync(
      "src/data/words.json",
      formatData([
        ...readFileSync(wordsFilePath, "utf8").split("\n"),
        ...readFileSync(ytzTxtFilePath, "utf8").split("\n"),
      ])
    );
  });
};

getWords();
