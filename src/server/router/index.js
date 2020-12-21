// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (!err) return res.json({ error: false });
  return res.status(500).json({ error: err.message });
}

function incorrectParameters(res) {
  res.status(406).json({ error: '406', message: '406 Incorrect parameters' });
}

function incorrectData(res) {
  res.status(406).json({ error: '406', message: '406 Incorrect data recived!' });
}

module.exports = {
  errorHandler,
  incorrectParameters,
  incorrectData,
};
