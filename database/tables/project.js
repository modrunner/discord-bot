module.exports = (sequelize, DataTypes) => {
	return sequelize.define("project", {
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		dateUpdated: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		latestFileId: {
			type: DataTypes.STRING,
		},
		secondLatestFileId: {
			type: DataTypes.STRING,
		},
	}, {
		timestamps: false,
	});
};