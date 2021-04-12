/* eslint-disable camelcase */
const moment = require('moment');
const Codes = require('../../models/postgres/codes.model');
const StandarException = require('../../exceptions/standard.exception');

const userRepository = {

  codeLogin: async (body) => {
    try {
      const { client_id } = body;
      const code = Math.random().toString(36).substring(2, 7).toUpperCase();
      const exp = moment().add(5, 'm').unix();

      const codeClient = await Codes.findOne({ where: { client_id } });

      if (!codeClient) {
        await Codes.create({ code, exp, client_id });
      } else {
        await codeClient.update({ code, exp });
      }

      return { code, exp };
    } catch (e) {
      throw new Error(e);
    }
  },

  codeValidate: async (body, io) => {
    const { code } = body;

    const codeClient = await Codes.findOne({ where: { code } });
    if (!codeClient) throw new StandarException(404, 'Code Invalid!');

    const time = moment(codeClient.exp, 'x') - moment().unix();
    if (time < 0) {
      const { client_id } = codeClient;
      const codes = await userRepository.codeLogin({ client_id });
      io.emit(client_id, codes);

      throw new StandarException(400, 'Code expirated!');
    }

    io.emit(codeClient.client_id, { code: 0, status: 'device_provisioned' });
    await codeClient.destroy();

    return { status: 'code_verified' };
  },
};

module.exports = userRepository;
