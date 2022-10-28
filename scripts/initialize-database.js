const Sequelize = require("sequelize");

const sequelize = new Sequelize("database", "username", "password", {
	host: "localhost",
	dialect: "sqlite",
	logging: false,
	storage: "./database/database.sqlite",
});

// Tables
const Guilds = require("../database/models/Guild")(sequelize, Sequelize.DataTypes);
const Projects = require("../database/models/Project")(sequelize, Sequelize.DataTypes);
const TrackedProjects = require("../database/models/TrackedProject")(sequelize, Sequelize.DataTypes);

// Initialization
const force = process.argv.includes("--force") || process.argv.includes("-f");
const alter = process.argv.includes("--alter") || process.argv.includes("-a");

if (force) {
	sequelize.sync({ force }).then(async () => {
		sequelize.close();
	}).catch(console.error);
} else if (alter) {
	sequelize.sync({ alter }).then(async () => {
		sequelize.close();
	}).catch(console.error);
} else {
	sequelize.sync().then(async () => {
		sequelize.close();
	}).catch(console.error);
}
