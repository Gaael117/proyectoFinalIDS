const express = require('express');
const cors = require('cors');
const { router: authRoutes } = require('./auth');
const { router: donationRoutes } = require('./donations');
const authMiddleware = require('./authMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/donations', donationRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API AliRed activa y funcionando' });
});

app.get('/admin', authMiddleware(['administrador']), (req, res) => {
  res.json({ message: 'Panel de administración de AliRed', user: req.user });
});

module.exports = app;