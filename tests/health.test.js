const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/prisma');

afterAll(() => prisma.$disconnect());

test('GET /api/health responde 200', async () => {
  const res = await request(app).get('/api/health');
  expect(res.status).toBe(200);
  expect(res.body.status).toBe('ok');
});

test('rota que não existe responde 404 no formato de erro', async () => {
  const res = await request(app).get('/api/nada');
  expect(res.status).toBe(404);
  expect(res.body.status).toBe(404);
  expect(res.body.message).toBeDefined();
});

test('banco responde e as tabelas existem', async () => {
  const users = await prisma.user.count();
  const rooms = await prisma.room.count();
  const reservations = await prisma.reservation.count();
  expect(users).toBeGreaterThanOrEqual(0);
  expect(rooms).toBeGreaterThanOrEqual(0);
  expect(reservations).toBeGreaterThanOrEqual(0);
});
