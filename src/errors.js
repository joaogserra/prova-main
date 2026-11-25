class AppError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

function notFound(req, res, next) {
  next(new AppError(404, 'Rota não encontrada.'));
}

// middleware de erro: precisa dos 4 parâmetros
function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ status: 400, message: 'JSON inválido.' });
  }

  if (err instanceof AppError) {
    const body = { status: err.status, message: err.message };
    if (err.errors) body.errors = err.errors;
    return res.status(err.status).json(body);
  }

  console.error(err);
  res.status(500).json({ status: 500, message: 'Erro interno do servidor.' });
}

module.exports = { AppError, notFound, errorHandler };
