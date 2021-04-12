/* eslint-disable no-console */
const brinksRepository = require('./brinks.repository');

const brinksController = {
  // eslint-disable-next-line arrow-body-style
  algorithm: async (req) => {
    return brinksRepository.algorithm(req.body);
  },
  promiseAll: async (req) => {
    console.time('total');
    const aux = brinksRepository.promiseAll(req);
    console.timeEnd('total');
    return aux;
  },
};

module.exports = brinksController;
