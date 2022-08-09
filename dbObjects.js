const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const GuildSettings = require('./models/GuildSettings')(sequelize, Sequelize.DataTypes);
const Projects = require('./models/Project')(sequelize, Sequelize.DataTypes);
const TrackedProjects = require('./models/TrackedProjects')(sequelize, Sequelize.DataTypes);

module.exports = { GuildSettings, Projects, TrackedProjects };