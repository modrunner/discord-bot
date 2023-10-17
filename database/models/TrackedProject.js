module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'trackedProject',
    {
      projectId: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      projectPlatform: {
        type: DataTypes.STRING,
        defaultValue: '---',
      },
      channelId: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      guildId: {
        type: DataTypes.STRING,
      },
      roleIds: {
        type: DataTypes.JSON,
        defaultValue: [],
        allowNull: true,
      },
    },
    {
      timestamps: false,
    }
  );
};
