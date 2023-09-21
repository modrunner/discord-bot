module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'project',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      platform: {
        type: DataTypes.ENUM,
        values: ['curseforge', 'ftb', 'modrinth'],
        primaryKey: true,
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
    },
    {
      timestamps: false,
			underscored: true,
    }
  );
};
