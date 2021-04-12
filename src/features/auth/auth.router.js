const Router = require('express');
const authController = require('./auth.controller');
const { loginValidator, signUpValidator, socialValidator } = require('./auth.validator');

var { verifytoken } = require("../../middlewares/auth.middleware");
var standarResponse = require("../../helpers/standard.response.helper");
var jwt = require("jsonwebtoken");

const authRoutes = (app) => {
  const router = new Router();

  router.post('/login', loginValidator, async (req, res, next) => {
    await authController.login(req, res, next)
      .then(response => standarResponse({ res, req, response }))
      .catch(e => next(e));
  });

  router.post('/social-google', socialValidator, async (req, res, next) => {
    await authController.socialGoogle(req, res, next)
      .then(response => standarResponse({ res, req, response }))
      .catch(e => next(e));
  });

  router.get('/refresh', verifytoken, async (req, res, next) => {
    /* si aplicamos socket no va */
    await authController.refreshToken(req, res, next)
      .then(response => standarResponse({ res, req, response }))
      .catch(e => next(e));
  });

  router.post('/signup', signUpValidator, async (req, res, next) => {
    await authController.signUp(req, res, next)
      .then(response => standarResponse({ res, req, response }))
      .catch(e => next(e));
  });

  app.use('/v1/auth', router);
};

module.exports = authRoutes;