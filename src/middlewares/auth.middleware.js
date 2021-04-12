const jwt = require('jsonwebtoken');
const { celebrate, Joi, Segments } = require('celebrate');
const roles = require('../constant/constant').ROLES;

const authMiddleware = {
  // Middleware verifica token
  verifytoken: (req, res, next) => {
    const { token } = req.headers;

    jwt.verify(token, process.env.JWT_SEED, (err, decoded) => {
      if (err) next(err);

      req.user = decoded.user;
      next();
    });
  },

  // Middleware verifica admin
  verifyadmin: (req, res, next) => {
    const { user } = req;
    if (user.id_role === roles.ROLE_ADMIN) {
      next();
    } else {
      return res.status(401).json({
        ok: false,
        message: 'No es administrador',
        errors: { message: 'No es administrador, no tiene permisos' },
      });
    }
  },

  // Middleware verifica usuario actual
  verifyme: (req, res, next) => {
    const { user } = req;
    const { id } = req.params;
    if (user.id === id) {
      next();
    } else {
      return res.status(401).json({
        ok: false,
        message: 'No es administrador, no tiene permisos',
        errors: { message: 'No es administrador, no tiene permisos' },
      });
    }
  },

  tokenVerify: celebrate({
    [Segments.HEADERS]: Joi.object().keys({
      token: Joi.string().required(),
    }).options({ allowUnknown: true }),
  }),
};

module.exports = authMiddleware;
