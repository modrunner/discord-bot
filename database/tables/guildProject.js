module.exports = (sequelize, DataTypes) => {
  return sequelize.define("guildProject", {
    guildId: {
      type: DataTypes.STRING,
      references: {
        model: "guild",
        key: "id",
      },
    },
    projectId: {
      type: DataTypes.STRING,
      references: {
        model: "project",
        key: "id",
      },
    },
    channelId: {
      type: DataTypes.STRING,
      references: {
        model: "channel",
        key: "id",
      },
    },
  }, {
    timestamps: false,
  });
};