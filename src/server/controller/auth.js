const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');
const { secretKey } = require('../../config');
const db = require('../../db');

async function registerUser(req, res) {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(406).json({ error: '406', message: 'Username and password is required!' });

  await db.createUser({ username, password });

  return res.sendStatus(200);
}

async function loginUser(req, res) {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(401).json({ error: '401', message: 'Username and password is required!' });

  const user = await db.getUser(username);

  if (!user) return res.status(403).json({ error: '403', message: 'User is not registered!' });

  if (username !== user.username || password !== user.password)
    return res.status(403).json({ error: '403', message: 'Bad username or password!' });

  const accessToken = jwt.sign({ id: user.id }, secretKey, { expiresIn: '1800s' });
  const refreshToken = nanoid(36);
  const expiresIn = Date.now() + 30 * 24 * 60 * 60 * 1000;

  await db.createSession({
    user_id: user.id,
    refresh_token: refreshToken,
    expires_in: expiresIn,
  });

  return res.json({ accessToken, refreshToken });
}

async function refreshTokens(req, res) {
  // eslint-disable-next-line dot-notation
  const authHeader = req.headers['authorization'];
  let refreshToken = authHeader && authHeader.split(' ')[1];

  if (!refreshToken) return res.sendStatus(401);

  const session = await db.getSession(refreshToken);

  if (!session || refreshToken !== session.refresh_token) return res.sendStatus(403);

  if (Date.now() > session.expires_in)
    return res.status(403).json({ error: '403', message: 'Token expired!' });

  const accessToken = jwt.sign({ id: session.user_id }, secretKey, { expiresIn: '1800s' });
  refreshToken = nanoid(36);
  const expiresIn = Date.now() + 30 * 24 * 60 * 60 * 1000;

  await db.updateSession({
    id: session.id,
    user_id: session.user_id,
    refresh_token: refreshToken,
    expires_in: expiresIn,
  });

  return res.json({ accessToken, refreshToken });
}

async function logoutUser(req, res) {
  // eslint-disable-next-line dot-notation
  const authHeader = req.headers['authorization'];
  const refreshToken = authHeader && authHeader.split(' ')[1];

  if (!refreshToken) return res.sendStatus(401);

  await db.deleteSession(refreshToken);

  return res.sendStatus(200);
}

module.exports = {
  registerUser,
  loginUser,
  refreshTokens,
  logoutUser,
};
