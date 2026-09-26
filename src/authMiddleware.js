const jwt = require('jsonwebtoken');

const authMiddleware = (rolesPermitidos = []) => {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Acceso denegado: Token no proporcionado' });
    }

    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
      req.user = verified;

      if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(req.user.role)) {
        return res.status(403).json({ error: 'Acceso denegado: Rol no autorizado' });
      }

      next();
    } catch (error) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }
  };
};

module.exports = authMiddleware;