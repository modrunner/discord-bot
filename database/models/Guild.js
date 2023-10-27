module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'guild',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      changelogLength: {
        type: DataTypes.INTEGER,
        defaultValue: 4000,
      },
      maxProjects: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
      },
      notificationStyle: {
        type: DataTypes.STRING,
        defaultValue: 'normal',
        validate: {
          isIn: [['normal', 'compact', 'custom', 'ai']],
        },
      },
    },
    {
      timestamps: false,
    }
  );
};
