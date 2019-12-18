module.exports = (locale, num) => {

  const date = new Date(num);
  return new Intl.DateTimeFormat(locale).format(date);
}