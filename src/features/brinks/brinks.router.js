const Router = require('express');
const brinksController = require('./brinks.controller');
const { brinksValidator } = require('./brinks.validator');

// var { verifytoken } = require("../../middlewares/auth.middleware");
const standarResponse = require('../../helpers/standard.response.helper');
// var jwt = require("jsonwebtoken");

const brinksRoutes = (app) => {
  const router = new Router();

  router.post('/algorithm', brinksValidator, async (req, res, next) => {
    await brinksController
      .algorithm(req, res, next)
      .then((response) => standarResponse({ res, req, response }))
      .catch((e) => next(e));
  });

  router.post('/promise-all', async (req, res, next) => {
    await brinksController
      .promiseAll(req, res, next)
      .then((response) => res.status(200).json(response))
      .catch((e) => next(e));
  });

  app.use('/v1/brinks', router);
};

module.exports = brinksRoutes;
