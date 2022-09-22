const Sequelize = require('sequelize');
const logger = require('../logger');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database/database.sqlite',
});

require("../database/tables/guild")(sequelize, Sequelize.DataTypes);
require("../database/tables/project")(sequelize, Sequelize.DataTypes);

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
		logger.info('Database initialized.');
		sequelize.close();
	}).catch(logger.error);
}