'use strict';

const express = require('express');
const session = require('express-session');
const cartRouter = require('./cartRouter');

const app = express();

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}));

app.use('/cart', cartRouter);

module.exports = app;
