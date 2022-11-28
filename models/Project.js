module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'Project',
    {
      project_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      project_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      project_slug: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      project_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date_modified: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      guild_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      post_channel: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );
};
