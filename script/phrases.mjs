import { load } from "cheerio";
import fetch from "node-fetch";
import PQueue from "p-queue";
import { createWriteStream, readFileSync, writeFileSync } from "fs";
import { ZDIC_URL, concurrency, formatData } from "./utils.mjs";

const getBsList = async () => {
  const res = await fetch(new URL("/cd/bs/", ZDIC_URL));
  const html = await res.text();
  const $ = load(html);
  return $(".pck")
    .map((_, item) => $(item).text())
    .get();
};

const getHansListByBs = async (bs) => {
  const getHansList = async (page = 1) => {
    const res = await fetch(new URL(`/cd/bs/bs/?bs=${bs}|${page}`, ZDIC_URL));
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

const getPhraseListByHans = async (hans) => {
  const getPhraseList = async (page = 1) => {
    const res = await fetch(new URL(`${hans}|${page}`, `${ZDIC_URL}/cd/bs/`));
    const html = await res.text();
    const $ = load(html);
    return {
      phrase: $(".nr-box li a")
        .map((_, item) => $(item).attr("href"))
        .get(),
      html: $,
    };
  };

  const { phrase, html } = await getPhraseList();

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
    const morePhrase = await Promise.all(
      paginate.map(async (page) => {
        const { phrase } = await getPhraseList(page);
        return phrase;
      })
    );
    return [...phrase, ...morePhrase.flat()];
  }
  return phrase;
};

const getPhrasePinyin = async (phraseURL) => {
  const res = await fetch(new URL(`${phraseURL}`, ZDIC_URL));
  const html = await res.text();
  const $ = load(html);

  const pinyin = $(".entry_title .z_ts2")
    .filter((_, item) => $(item).text() === "拼音")
    .next(".dicpy")
    .text();
  return pinyin;
};

const getPhrases = async () => {
  const queue = new PQueue({ concurrency });
  const bsList = await getBsList();

  const phrasesFilePath = "src/data/phrases.txt";

  const phrases = createWriteStream(phrasesFilePath);

  bsList.forEach((bs) => {
    queue.add(
      async () => {
        const hansList = await getHansListByBs(bs);
        hansList.forEach(async (hans) => {
          queue.add(
            async () => {
              const phraseList = await getPhraseListByHans(hans);
              phraseList.forEach(async (phraseURL) => {
                queue.add(
                  async () => {
                    const pinyin = await getPhrasePinyin(phraseURL);
                    const data = `${phraseURL.split("/").pop()}:${pinyin}`;
                    console.log(data);
                    console.count();
                    phrases.write(`${data}\n`);
                  },
                  { priority: 2 }
                );
              });
            },
            { priority: 1 }
          );
        });
      },
      { priority: 0 }
    );
  });

  queue.on("completed", () => {
    writeFileSync(
      "src/data/phrases.json",
      formatData(readFileSync(phrasesFilePath, "utf8").split("\n"))
    );
  });
};
