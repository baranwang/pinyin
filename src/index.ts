import { Segment } from "novel-segment";
import { resolve } from 'path'
import wordsDict from "./data/words.json";
import phrasesDict from "./data/phrases.json";
import segmentDict from './data/dict.txt'

type ITextArray = {
  type: 'hans' | 'nohans'
  text: string;
}[]
export class Pinyin {
  #segment = new Segment()

  #wordsDict: Record<string, string> = {};

  #phrasesDict: Record<string, string> = {};

  constructor() {
    this.#wordsDict = this.#convertDict(require(wordsDict));
    this.#phrasesDict = this.#convertDict(require(phrasesDict));
    this.#segment.useDefault({ nodict: true })
    this.#segment.loadDict(resolve(__dirname, segmentDict));
  }

  get(text: string) {
    const textArr = this.#convertText(text);
    return this.#convertPinyin(textArr);
  }

  #convertDict(dict: Record<string, string[]>) {
    const reslut: Record<string, string> = {};
    Object.keys(dict).forEach((key) => {
      dict[key].forEach((word) => {
        reslut[word] = key;
      });
    });
    return reslut;
  }

  #convertText(text: string) {
    if (typeof text !== "string") {
      return [];
    }
    let textArr: ITextArray = [];
    let hans = "";
    let nohans = "";
    for (let index = 0; index < text.length; index++) {
      const words = text[index];
      if (this.#wordsDict[words]) {
        hans += words;
        if (nohans.length > 0) {
          textArr.push({ text: nohans, type: 'nohans' });
          nohans = "";
        }
      } else {
        nohans += words;
        if (hans.length > 0) {
          textArr.push({ text: hans, type: 'hans' });
          hans = "";
        }
      }
    }
    if (hans.length > 0) {
      textArr.push({ text: hans, type: 'hans' });
    }
    if (nohans.length > 0) {
      textArr.push({ text: nohans, type: 'nohans' });
    }
    return textArr;
  }

  #finder(dict: Record<string, string>, text: string) {
    return dict[text] ?? "";
  }

  #convertPinyin(textArr: ITextArray) {
    let reslut: string[][] = []
    for (let index = 0; index < textArr.length; index++) {
      const item = textArr[index];
      if (item.type === 'nohans') {
        reslut.push([item.text]);
      }
      if (item.type === 'hans') {
        const data = this.#segment.doSegment(item.text, {
          simple: true,
        })
        data.forEach((word) => {
          const res = this.#finder(this.#phrasesDict, word)
          if (res) {
            reslut.push([res]);
          } else {
            reslut.push(...word.split('').map(item => this.#finder(this.#wordsDict, item).split(',')))
          }
        })
      }
    }

    return reslut.filter(item => item.length > 0 && item.every(i => i.length > 0))
  }
}

export default Pinyin;
