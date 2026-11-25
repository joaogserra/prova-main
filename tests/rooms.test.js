const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/prisma');

afterAll(() => prisma.$disconnect());

describe('CRUD de salas (/api/rooms)', () => {
  const nomeDaSala = 'Sala de Teste ' + Date.now();
  let salaId;

  test('POST /api/rooms cria uma sala', async () => {
    const res = await request(app).post('/api/rooms').send({
      name: nomeDaSala,
      capacity: 10,
      location: 'Bloco A',
    });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe(nomeDaSala);
    expect(res.body.id).toBeDefined();

    salaId = res.body.id;
  });

  test('POST /api/rooms com dados inválidos responde 400', async () => {
    const res = await request(app).post('/api/rooms').send({
      name: '',
      capacity: -1,
      location: '',
    });

    expect(res.status).toBe(400);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  test('POST /api/rooms com nome repetido responde 409', async () => {
    const res = await request(app).post('/api/rooms').send({
      name: nomeDaSala,
      capacity: 5,
      location: 'Bloco B',
    });

    expect(res.status).toBe(409);
  });

  test('GET /api/rooms lista as salas', async () => {
    const res = await request(app).get('/api/rooms');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/rooms/:id busca a sala criada', async () => {
    const res = await request(app).get('/api/rooms/' + salaId);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(salaId);
  });

  test('GET /api/rooms/:id com id que não existe responde 404', async () => {
    const res = await request(app).get('/api/rooms/999999');
    expect(res.status).toBe(404);
  });

  test('GET /api/rooms/:id com id inválido responde 400', async () => {
    const res = await request(app).get('/api/rooms/abc');
    expect(res.status).toBe(400);
  });

  test('PUT /api/rooms/:id atualiza a sala', async () => {
    const res = await request(app).put('/api/rooms/' + salaId).send({
      name: nomeDaSala,
      capacity: 20,
      location: 'Bloco C',
    });

    expect(res.status).toBe(200);
    expect(res.body.capacity).toBe(20);
    expect(res.body.location).toBe('Bloco C');
  });

  test('DELETE /api/rooms/:id remove a sala', async () => {
    const res = await request(app).delete('/api/rooms/' + salaId);
    expect(res.status).toBe(204);
  });

  test('DELETE /api/rooms/:id em sala já removida responde 404', async () => {
    const res = await request(app).delete('/api/rooms/' + salaId);
    expect(res.status).toBe(404);
  });
});
