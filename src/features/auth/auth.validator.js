const { celebrate, Joi, Segments } = require('celebrate');

const authValidator = {

  signUpValidator: celebrate({
    [Segments.BODY]: Joi.object().keys({
      id_role: Joi.number().integer().required().label('role id'),
      name: Joi.string().required().min(3).max(80).label('name'),
      email: Joi.string().required().min(7).max(80).email().trim().label('e-mail'),
      last_name: Joi.string().required().min(3).max(80).label('last name'),
      password: Joi.string().pattern(/^[a-zA-Z0-9]{5,30}$/),
      repeat_password: Joi.any().valid(Joi.ref('password')).required().strip(),
      avatar: Joi.string().min(5).max(200).allow('', null),
    })
  }),

  loginValidator: celebrate({
    [Segments.BODY]: Joi.object().keys({
      email: Joi.string().required().email().trim().label('e-mail'),
      password: Joi.string().required().pattern(/^[a-zA-Z0-9]{5,30}$/),
    })
  }),

  socialValidator: celebrate({
    [Segments.BODY]: Joi.object().keys({
      token: Joi.any().required(),
    })
  }),

};

module.exports = authValidator;
