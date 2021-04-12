const { db } = require("../../database/db.mysql");
const Roles = require("../../models/mysql/role.model");

const userModel = db.sequelize.define('users', {
  id: {
    type: db.Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    field: 'id'
  },
  id_role: {
    type: db.Sequelize.INTEGER,
    allowNull: false,
    field: 'id_role'
  },
  username: {
    type: db.Sequelize.STRING,
    field: 'username',
    allowNull: false,
    unique: false
  },
  name: {
    type: db.Sequelize.STRING,
    allowNull: false,
    field: 'name'
  },
  last_name: {
    type: db.Sequelize.STRING,
    allowNull: false,
    field: 'last_name'
  },
  avatar: {
    type: db.Sequelize.STRING,
    allowNull: true,
    field: 'avatar'
  },
  email: {
    type: db.Sequelize.STRING,
    allowNull: false,
    unique: true,
    field: 'email'
  },
  password: {
    type: db.Sequelize.STRING,
    allowNull: false,
    field: 'password'
  },
  active: {
    type: db.Sequelize.INTEGER,
    allowNull: false,
    defaultValue: '0',
    field: 'active'
  },
  access_token: {
    type: db.Sequelize.STRING,
    allowNull: true,
    field: 'access_token'
  },
  social: {
    type: db.Sequelize.INTEGER,
    allowNull: false,
    defaultValue: '0',
    field: 'social'
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
  tableName: 'users'
}
);

db.users = userModel;

db.users.belongsTo(Roles, {
  foreignKey: 'id_role'
});

module.exports = db.users;