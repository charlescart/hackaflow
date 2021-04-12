const authRepository = require('./auth.repository');

const authController = {

  signUp: async (req, res, next) => {
    return await authRepository.signUp(req);
  },

  login: async (req, res, next) => {
    return await authRepository.login(req);
  },

  socialGoogle: async (req, res, next) => {
    return await authRepository.socialGoogle(req);
  },

  refreshToken: async (req, res, next) => {
    return await authRepository.refreshToken(req);
  },

}

module.exports = authController;