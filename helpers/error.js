module.exports = (msg, opts = { status: 200 }) => {

  const e = new Error(msg);
  for (let opt in opts)
    e[opt] = opts[opt];
  return e;
};