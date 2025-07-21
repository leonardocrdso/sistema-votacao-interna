// Middleware de autenticação para rotas admin
const adminAuth = (req, res, next) => {
  const token = req.header('x-admin-token');
  const expectedToken = process.env.ADMIN_TOKEN || 'eAyL5frRilDo5JivmkrT0CAQ2d4AfGyIXnzV47YRZm2a6GbAnM';

  if (!token) {
    return res.status(401).json({
      sucesso: false,
      erro: 'Token de acesso requerido'
    });
  }

  if (token !== expectedToken) {
    return res.status(403).json({
      sucesso: false,
      erro: 'Token de acesso inválido'
    });
  }

  next();
};

module.exports = {
  adminAuth
};