const express = require('express');
const { notFound, errorHandler } = require('./errors');
const roomsRouter = require('./routes/rooms');

const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/rooms', roomsRouter);

// TODO: rotas de auth e reservations

app.use(notFound);
app.use(errorHandler);

module.exports = app;
