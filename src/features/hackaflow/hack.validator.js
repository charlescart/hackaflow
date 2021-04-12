/* eslint-disable comma-dangle */
/* eslint-disable quotes */
const { celebrate, Joi, Segments } = require("celebrate");

const hackValidator = {
  codeLoginValidator: celebrate({
    [Segments.BODY]: Joi.object().keys({
      client_id: Joi.string().trim().required().label('client id'),
    }).rename('clientId', 'client_id'),
  }),
  codeValidate: celebrate({
    [Segments.BODY]: Joi.object().keys({
      code: Joi.string().trim().required().label('code'),
    }),
  }),
};

module.exports = hackValidator;
