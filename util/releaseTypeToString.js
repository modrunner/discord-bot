module.exports = {
	releaseTypeToString(releaseType) {
		switch (releaseType) {
		case 1:
			return 'Release';
		case 2:
			return 'Beta';
		case 3:
			return 'Alpha';
		default:
			return 'unknown';
		}
	},
};