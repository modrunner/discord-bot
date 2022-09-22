const Sequelize = require("sequelize");

const sequelize = new Sequelize("database", "user", "password", {
  host: "localhost",
  dialect: "sqlite",
  logging: false,
  storage: "database/database.sqlite",
});

// Tables
const Channels = require("./tables/channel")(sequelize, Sequelize.DataTypes);
const Guilds = require("./tables/guild")(sequelize, Sequelize.DataTypes);
const GuildProjects = require("./tables/guildProject")(sequelize, Sequelize.DataTypes);
const Projects = require("./tables/project")(sequelize, Sequelize.DataTypes);

// Associations
Guilds.hasMany(Channels);
Channels.belongsTo(Guilds);

Guilds.belongsToMany(Projects, { through: GuildProjects });
Projects.belongsToMany(Guilds, { through: GuildProjects });

Channels.belongsToMany(Projects, { through: GuildProjects });
Projects.belongsToMany(Channels, { through: GuildProjects });


module.exports = { Channels, Guilds, GuildProjects, Projects };