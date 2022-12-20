module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'tracked_projects',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
      },
      platform: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date_updated: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      latest_file_id: {
        type: DataTypes.STRING,
      },
      second_latest_file_id: {
        type: DataTypes.STRING,
      },
      guild_data: {
        type: DataTypes.JSON,
        allowNull: false,
        /* JSON should match
			{
				'guilds': [
					{
						'id': 1233456789,
						'channels': [
							987654321
						]
					}
				]
			}
			*/
      },
    },
    {
      timestamps: false,
    }
  );
};
