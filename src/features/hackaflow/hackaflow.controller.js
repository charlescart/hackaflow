/* eslint-disable arrow-body-style */
/* eslint-disable no-dupe-keys */
const hackRepository = require('./hack.repository');

const hackController = {
  codeLogin: async (req) => {
    return hackRepository.codeLogin(req.body);
  },

  codeValidate: async (req, io) => {
    return hackRepository.codeValidate(req.body, io);
  },
};

module.exports = hackController;
