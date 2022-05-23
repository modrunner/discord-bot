const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

require('./models/Project')(sequelize, Sequelize.DataTypes);

const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({ force }).then(async () => {
	if (force) {
		console.log('Database reset and re-initialized.');
	} else {
		console.log('Databse initialized.');
	}
	sequelize.close();
}).catch(console.error);