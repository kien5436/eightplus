const i18n = require('./i18n');
const extractAssets = require('./extract-assets');

/**
 * @param { Object } { dict: translation words, currentUser, activeRoute, locale }
 * @param {Object} res express's response
 */
module.exports = ({ locale, dict, currentUser, activeRoute }, res) => {

  const assets = extractAssets(res, '404');
  dict['404'] = i18n(locale, '404');
  dict[activeRoute]['title'] = dict['404']['title'];

  res.render('error/404', { ...assets, dict, currentUser, activeRoute });
}