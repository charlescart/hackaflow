const { db } = require("../../database/db.mysql");

const rolesModel = db.sequelize.define('roles', {
  id: {
    type: db.Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    field: 'id'
  },
  role: {
    type: db.Sequelize.STRING,
    allowNull: false,
    field: 'role'
  },
  deleted: {
    type: db.Sequelize.INTEGER,
    allowNull: false,
    defaultValue: '0',
    field: 'deleted'
  },
  createdAt: {
    type: db.Sequelize.DATE,
    field: 'created_at'
  },
  updatedAt: {
    type: db.Sequelize.DATE,
    field: 'updated_at'
  },
}, {
  timestamps: true,
  freezeTableName: true,
  tableName: 'roles'
}
);

db.roles = rolesModel;

module.exports = db.roles;