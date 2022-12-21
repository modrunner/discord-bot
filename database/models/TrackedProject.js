module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'trackedProject',
    {
      projectId: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      guildId: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      channelId: {
        type: DataTypes.STRING,
        primaryKey: true,
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
