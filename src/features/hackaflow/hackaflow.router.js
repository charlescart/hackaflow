const Router = require('express');
const hackController = require('./hackaflow.controller');
const standarResponse = require('../../helpers/standard.response.helper');

const {
  codeLoginValidator,
  codeValidate,
} = require('./hack.validator');

const hackRoutes = (app, io) => {
  const router = new Router();

  router.post('/code-login', [codeLoginValidator], async (req, res, next) => {
    await hackController
      .codeLogin(req, res, next)
      .then((response) => standarResponse({ res, req, response }))
      .catch((e) => next(e));
  });

  router.post('/code-validate', [codeValidate], async (req, res, next) => {
    await hackController
      .codeValidate(req, io)
      .then((response) => standarResponse({ res, req, response }))
      .catch((e) => next(e));
  });

  app.use('/hackaflow/v1', router);
};

module.exports = hackRoutes;
