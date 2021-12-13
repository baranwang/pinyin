export const ZDIC_URL = "https://www.zdic.net/";

export const concurrency = 5;

/**
 *
 * @param {string[]} data
 */
export const formatData = (data) => {
  const result = {};
  data.forEach((item) => {
    const [word, pinyin] = item.split(":");
    result[pinyin] = [...(result[pinyin] || []), word];
  });
  return JSON.stringify(result, null, 2);
};
