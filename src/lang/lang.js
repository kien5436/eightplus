const en = require('./en.json.js.js'),
    vi = require('./vi.json.js.js');

module.exports = {

    en: en,
    vi: vi,

    print(key, lang = 'en') {

        if (key.trim() === '') return undefined;

        let msg = this[lang];
        key = key.trim().split('.');

        for (let i = 0; i < key.length; ++i) {
            if (!msg.hasOwnProperty(key[i])) throw new Error(`'${ key[i] }' is undefined`);
            msg = msg[key[i]];
        }

        return msg;
    }
};