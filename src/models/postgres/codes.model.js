const { db } = require('../../database/db.postgre');

const codesModel = db.sequelize.define('codes', {
  id: {
    type: db.Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    field: 'id',
  },
  code: {
    type: db.Sequelize.STRING(5),
    allowNull: false,
    field: 'code',
    unique: false,
  },
  exp: {
    type: db.Sequelize.STRING(20),
    field: 'exp',
    allowNull: false,
  },
  client_id: {
    type: db.Sequelize.STRING(100),
    allowNull: false,
    field: 'client_id',
    unique: false,
  },
}, {
  timestamps: false,
  freezeTableName: true,
  tableName: 'codes',
  indexes: [
    {
      unique: true,
      fields: ['code', 'client_id'],
    },
  ],
});

db.codes = codesModel;

module.exports = db.codes;
