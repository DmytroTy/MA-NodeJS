/* eslint-disable consistent-return */
const jwt = require('jsonwebtoken');
const { secretKey } = require('../../config');
const { DatabaseError } = require('../../db/checkError');

function authenticateToken(req, res, next) {
  // Gather the jwt access token from the request header
  // eslint-disable-next-line dot-notation
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401); // if there isn't any token

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      console.log(err);
      return res.sendStatus(403);
    }
    req.user = user;
    next(); // pass the execution off to whatever request the client intended
  });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (!err) return res.json({ error: false });

  if (err instanceof DatabaseError) {
    return res.status(409).json({ error: '409', message: err.message });
  }

  console.error(err);
  return res.status(500).json({ error: '500', message: '500 Server error' });
}

module.exports = {
  authenticateToken,
  errorHandler,
};
