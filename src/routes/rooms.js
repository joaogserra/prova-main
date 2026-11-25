const express = require('express');
const prisma = require('../prisma');
const { AppError } = require('../errors');

const router = express.Router();

// Confere se os dados da sala são válidos.
// Retorna uma lista de mensagens de erro (lista vazia = tudo certo).
function validarDadosDaSala(dados) {
  const erros = [];

  if (!dados.name || typeof dados.name !== 'string' || !dados.name.trim()) {
    erros.push('O campo "name" é obrigatório.');
  }

  if (
    dados.capacity === undefined ||
    dados.capacity === null ||
    !Number.isInteger(dados.capacity) ||
    dados.capacity <= 0
  ) {
    erros.push('O campo "capacity" deve ser um número inteiro maior que zero.');
  }

  if (!dados.location || typeof dados.location !== 'string' || !dados.location.trim()) {
    erros.push('O campo "location" é obrigatório.');
  }

  return erros;
}

// Pega o :id da rota e transforma em número.
// Se não for um número inteiro válido, já lança o erro 400.
function pegarIdDaRota(req) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, 'ID inválido.');
  }

  return id;
}

// GET /api/rooms - lista todas as salas
router.get('/', async (req, res, next) => {
  try {
    const rooms = await prisma.room.findMany({ orderBy: { id: 'asc' } });
    res.json(rooms);
  } catch (err) {
    next(err);
  }
});

// GET /api/rooms/:id - busca uma sala pelo id
router.get('/:id', async (req, res, next) => {
  try {
    const id = pegarIdDaRota(req);

    const room = await prisma.room.findUnique({ where: { id } });
    if (!room) {
      throw new AppError(404, 'Sala não encontrada.');
    }

    res.json(room);
  } catch (err) {
    next(err);
  }
});

// POST /api/rooms - cria uma sala nova
router.post('/', async (req, res, next) => {
  try {
    const { name, capacity, location } = req.body;

    const erros = validarDadosDaSala({ name, capacity, location });
    if (erros.length > 0) {
      throw new AppError(400, 'Dados inválidos.', erros);
    }

    const room = await prisma.room.create({
      data: {
        name: name.trim(),
        capacity,
        location: location.trim(),
      },
    });

    res.status(201).json(room);
  } catch (err) {
    // P2002 é o código do Prisma para violação de campo "unique"
    if (err.code === 'P2002') {
      return next(new AppError(409, 'Já existe uma sala com esse nome.'));
    }
    next(err);
  }
});

// PUT /api/rooms/:id - atualiza uma sala existente
router.put('/:id', async (req, res, next) => {
  try {
    const id = pegarIdDaRota(req);
    const { name, capacity, location } = req.body;

    const erros = validarDadosDaSala({ name, capacity, location });
    if (erros.length > 0) {
      throw new AppError(400, 'Dados inválidos.', erros);
    }

    const salaExistente = await prisma.room.findUnique({ where: { id } });
    if (!salaExistente) {
      throw new AppError(404, 'Sala não encontrada.');
    }

    const room = await prisma.room.update({
      where: { id },
      data: {
        name: name.trim(),
        capacity,
        location: location.trim(),
      },
    });

    res.json(room);
  } catch (err) {
    if (err.code === 'P2002') {
      return next(new AppError(409, 'Já existe uma sala com esse nome.'));
    }
    next(err);
  }
});

// DELETE /api/rooms/:id - remove uma sala
router.delete('/:id', async (req, res, next) => {
  try {
    const id = pegarIdDaRota(req);

    const salaExistente = await prisma.room.findUnique({ where: { id } });
    if (!salaExistente) {
      throw new AppError(404, 'Sala não encontrada.');
    }

    // não deixa remover sala que já tem reserva vinculada
    const totalDeReservas = await prisma.reservation.count({ where: { roomId: id } });
    if (totalDeReservas > 0) {
      throw new AppError(409, 'Sala possui reservas e não pode ser removida.');
    }

    await prisma.room.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
