/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
const _ = require('lodash');

/**
   * @description: keys a remover.
   */
const keysToRemove = [
  'password', 'repeat_password', 'access_token',
];

/**
 * @function: objectSafe
 * @params: obj: Object.
 * @description: Cambia el valor de keys en el objecto.
 */
const objectSafe = (obj) => {
  for (const key in obj) {
    if (_.includes(keysToRemove, key)) obj[key] = undefined;
    if (typeof obj[key] === 'object') objectSafe(obj[key]);
  }
};

const standardResponse = (opts) => {
  _.defaults(opts, { status: 200, code: 0, msg: 'ok' });

  const {
    res, response, status, err, code, msg,
  } = opts;

  const result = { response, code, msg };

  objectSafe(response);

  if (err) {
    result.code = 1;
    result.msg = msg;
    result.error = err;
  }

  res.status(status).json(result);
};

module.exports = standardResponse;
