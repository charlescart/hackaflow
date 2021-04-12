/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-disable no-useless-catch */

const Sequelize = require('sequelize');
const pg = require('pg');
const {
  DB, USER, PASSWORD, HOST,
} = require('../config/db.config');

const dbConnect = {
  sequelizeConnection: null,
  singleton: () => {
    if (dbConnect.sequelizeConnection === null) {
      try {
        dbConnect.sequelizeConnection = new Sequelize(DB, USER, PASSWORD, {
          host: HOST,
          dialect: 'postgres',
          dialectOptions: {
            ssl: {
              require: true, // This will help you. But you will see nwe error
              rejectUnauthorized: false, // This line will fix new error
            },
          },
        });

        dbConnect.sequelizeConnection.authenticate()
          .then(() => {
            console.log('DB Connected');
          })
          .catch((err) => {
            console.log('No DB connected', err);
          });
      } catch (err) {
        throw err;
      }

      return dbConnect.sequelizeConnection;
    }
  },
};

pg.defaults.ssl = true;

const db = {};
db.Sequelize = Sequelize;
db.sequelize = dbConnect.singleton();

const { Op } = Sequelize;

module.exports = {
  db,
  Op,
};
