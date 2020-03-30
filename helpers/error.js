module.exports = (msg, opts = { status: 400 }) => {

  const e = new Error(msg);
  for (let opt in opts)
    e[opt] = opts[opt];
  return e;
};