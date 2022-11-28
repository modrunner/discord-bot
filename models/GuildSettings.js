module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'guild_setting',
    {
      guild_id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      is_lightweight_mode_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      timestamps: false,
    }
  );
};
