const logger = require('../logger');
const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

require('../models/GuildSettings')(sequelize, Sequelize.DataTypes);
require('../models/Project')(sequelize, Sequelize.DataTypes);
require('../models/TrackedProjects')(sequelize, Sequelize.DataTypes);

const force = process.argv.includes('--force') || process.argv.includes('-f');
const alter = process.argv.includes('--alter') || process.argv.includes('-a');

if (force) {
	sequelize.sync({ force }).then(async () => {
		logger.info('Database reset.');
		sequelize.close();
	}).catch(logger.error);
} else if (alter) {
	sequelize.sync({ alter }).then(async () => {
		logger.info('Database altered.');
		sequelize.close();
	}).catch(logger.error);
} else {
	sequelize.sync().then(async () => {
		logger.info('Database intialized.');
		sequelize.close();
	}).catch(logger.error);
}