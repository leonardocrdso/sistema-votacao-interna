const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');

// Middleware para rotas não encontradas
const notFound = (req, res, next) => {
  const error = new Error(`Rota não encontrada - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

// Middleware de tratamento de erros
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log do erro no console
  console.error(`❌ Erro: ${err.message}`);
  console.error(err.stack);

  // Erro de validação do Prisma (dados duplicados, etc.)
  if (err instanceof PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      // Violação de constraint única
      const field = err.meta?.target?.[0] || 'campo';
      error.message = `Registro duplicado para ${field}`;
      error.status = 409;
    } else if (err.code === 'P2025') {
      // Registro não encontrado
      error.message = 'Registro não encontrado';
      error.status = 404;
    } else if (err.code === 'P2003') {
      // Violação de chave estrangeira
      error.message = 'Referência inválida';
      error.status = 400;
    } else {
      error.message = 'Erro no banco de dados';
      error.status = 500;
    }
  }

  // Erro de validação de entrada
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error.message = `Dados inválidos: ${message}`;
    error.status = 400;
  }

  // Erro de JWT
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Token inválido';
    error.status = 401;
  }

  // Erro de token expirado
  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expirado';
    error.status = 401;
  }

  // Erro de sintaxe JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error.message = 'JSON malformado';
    error.status = 400;
  }

  // Erro de arquivo muito grande
  if (err.code === 'LIMIT_FILE_SIZE') {
    error.message = 'Arquivo muito grande. Máximo permitido: 5MB';
    error.status = 413;
  }

  // Erro de tipo de arquivo inválido
  if (err.code === 'INVALID_FILE_TYPE') {
    error.message = 'Tipo de arquivo inválido. Apenas imagens são permitidas';
    error.status = 400;
  }

  // Status padrão
  const status = error.status || err.statusCode || 500;

  // Resposta de erro
  res.status(status).json({
    sucesso: false,
    erro: error.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  notFound,
  errorHandler
};