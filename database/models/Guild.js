module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "guild",
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      changelogMaxLength: {
        type: DataTypes.INTEGER,
        defaultValue: 4000,
      },
      maxTrackedProjects: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
      },
      notificationStyle: {
        type: DataTypes.STRING,
        defaultValue: "normal",
        validate: {
          isIn: [["normal", "compact"]],
        },
      },
    },
    {
      timestamps: false,
    }
  );
};
