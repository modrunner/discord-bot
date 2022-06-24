module.exports = {
	classIdToString(classId) {
		if (classId === 6) {
			return 'Mod';
		} else if (classId === 4471) {
			return 'Modpack';
		} else {
			return 'Other';
		}
	},
};