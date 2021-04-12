/* eslint-disable camelcase */
/* eslint-disable no-console */
const hackRepository = require('./hack.repository');

const hackSocket = (app, io) => {
  io.on('connection', async (socket) => {
    socket.send({ status: 'Socket Connected!', deviceId: socket.id });

    socket.on('easy-login', async (data, callback) => {
      const { client_id } = data;
      console.log(`client_id: ${client_id}`);

      const code = await hackRepository.codeLogin({ client_id });
      callback(code);
      // data.send(code);
      // socket.emit('easy-login', code);
    });
  });
};

module.exports = hackSocket;
