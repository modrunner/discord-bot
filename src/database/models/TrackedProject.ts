import type { Sequelize } from 'sequelize';

export default (sequelize: Sequelize, DataTypes: any) => {
  return sequelize.define(
    "trackedProject",
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
    },
    {
      timestamps: false,
    }
  );
};
