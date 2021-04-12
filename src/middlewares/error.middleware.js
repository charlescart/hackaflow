const { isCelebrate } = require('celebrate');
const standarResponse = require('../helpers/standard.response.helper');

const handleError = (err, res, req) => {
  const { statusCode, message: msg } = err;

  // eslint-disable-next-line no-param-reassign
  if (isCelebrate(err)) err = err.joi.details;

  standarResponse({
    err, res, req, msg, status: statusCode || 400, code: 1,
  });
};

module.exports = handleError;
