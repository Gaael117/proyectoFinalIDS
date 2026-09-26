const express = require('express');
const authMiddleware = require('./authMiddleware');

const router = express.Router();
const donations = [];

router.post('/', authMiddleware(['empresa_donante', 'administrador']), (req, res) => {
  const { recurso, cantidad } = req.body;
  if (!recurso || !cantidad) {
    return res.status(400).json({ error: 'Recurso y cantidad son obligatorios' });
  }

  const newDonation = {
    id: donations.length + 1,
    recurso,
    cantidad,
    donanteId: req.user.id,
    estado: 'Disponible'
  };
  donations.push(newDonation);

  res.status(201).json({ message: 'Donación registrada con éxito', donation: newDonation });
});

router.get('/', authMiddleware(), (req, res) => {
  res.json({ donations });
});

module.exports = { router, donations };