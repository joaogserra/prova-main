# API de Reserva de Salas

Projeto de Desenvolvimento de API Backend. Node.js, Express, Prisma e SQLite.

## Como rodar

```
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run dev
```

Teste: http://localhost:3000/api/health

Para criar o usuário administrador inicial:

```
npx prisma db seed
```

Email e senha padrão ficam em `.env` (`ADMIN_EMAIL` e `ADMIN_PASSWORD`).

## Rotas de salas (`/api/rooms`)

| Método | Rota             | Descrição                      |
| ------ | ---------------- | ------------------------------- |
| GET    | /api/rooms       | Lista todas as salas            |
| GET    | /api/rooms/:id   | Busca uma sala pelo id          |
| POST   | /api/rooms       | Cria uma sala                   |
| PUT    | /api/rooms/:id   | Atualiza uma sala               |
| DELETE | /api/rooms/:id   | Remove uma sala                 |

Corpo esperado em POST/PUT:

```json
{ "name": "Sala 1", "capacity": 10, "location": "Bloco A" }
```

Regras: `name` é único, `capacity` precisa ser inteiro maior que zero, e uma sala
com reservas vinculadas não pode ser removida.

## Testes

Rode `npx prisma migrate dev` antes, para o banco existir.

```
npm test
```

## Pastas

- `prisma/` schema do banco e migrations
- `src/app.js` configuração do Express e rotas
- `src/errors.js` AppError, rota não encontrada e tratamento de erros
- `src/server.js` sobe o servidor
- `tests/` testes com Jest e Supertest

## Formato de erro

```
{ "status": 409, "message": "A sala já está reservada nesse horário." }
```

Para lançar um erro: `throw new AppError(409, 'mensagem')`.

## Git

Uma branch por funcionalidade e pull request revisado por outro integrante antes de ir para a main.
