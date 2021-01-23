const express = require('express');
const asyncHandler = require('express-async-handler');
const { registerUser, loginUser, refreshTokens, logoutUser } = require('../controller/auth');

const auth = express.Router();

auth.post(
  '/register',
  asyncHandler(async (req, res) => {
    await registerUser(req, res);
  }),
);

auth.post(
  '/login',
  asyncHandler(async (req, res) => {
    await loginUser(req, res);
  }),
);

auth.get(
  '/refresh-tokens',
  asyncHandler(async (req, res) => {
    await refreshTokens(req, res);
  }),
);

auth.get(
  '/logout',
  asyncHandler(async (req, res) => {
    await logoutUser(req, res);
  }),
);

module.exports = auth;
