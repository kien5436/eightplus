const en = require('./en.json');
const vi = require('./vi.json');
const dict = { en, vi };
/**
 * @param   {String} locale
 * @param   {String} words
 * @returns {mixed} Object or single translation
 */
module.exports = (locale, ...words) => {

  if (words.length === 1) return dict[locale][words[0]];

  const trans = {};
  for (const word of words) trans[word] = dict[locale][word];

  return trans;
};