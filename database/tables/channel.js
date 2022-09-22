module.exports = (sequelize, DataTypes) => {
  return sequelize.define("channel", {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
  }, {
    timestamps: false,
  });
};
