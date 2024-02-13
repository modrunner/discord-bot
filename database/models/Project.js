module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'project',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      platform: {
        type: DataTypes.STRING,
      },
      name: {
        type: DataTypes.STRING,
      },
      dateUpdated: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      fileIds: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      gameId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      timestamps: false,
    }
  );
};
