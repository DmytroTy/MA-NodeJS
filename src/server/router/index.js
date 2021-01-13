const { DatabaseError } = require('../../db/checkError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (!err) return res.json({ error: false });

  if (err instanceof DatabaseError) {
    return res.status(409).json({ error: '409', message: err.message });
  }

  return res.status(500).json({ error: '500', message: '500 Server error' });
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
