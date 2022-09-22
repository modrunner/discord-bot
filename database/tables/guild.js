module.exports = (sequelize, DataTypes) => {
  return sequelize.define("guild", {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    notificationStyle: {
      type: DataTypes.STRING,
      defaultValue: "normal",
    },
    changelogMaxLength: {
      type: DataTypes.INTEGER,
      defaultValue: 2000,
    }
  }, {
    timestamps: false,
  });
};