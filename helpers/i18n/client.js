import en from './en.json';
import vi from './vi.json';

const dict = { en, vi };

export default (locale, words) => dict[locale][words];