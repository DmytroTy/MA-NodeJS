// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (!err) return res.json({ error: false });
  return res.status(500).json({ error: err.message });
};

module.exports = {
  errorHandler,
};
