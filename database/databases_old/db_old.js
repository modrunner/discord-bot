const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'user', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  storage: './database/databases_old/db_v3.sqlite',
});

// Tables
const oldGuilds = require('./models/Guild')(sequelize, Sequelize.DataTypes);
const oldProjects = require('./models/Project')(sequelize, Sequelize.DataTypes);
const oldTrackedProjects = require('./models/TrackedProject')(sequelize, Sequelize.DataTypes);

module.exports = { oldGuilds, oldProjects, oldTrackedProjects };
