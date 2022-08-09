const logger = require("../logger");

class ApiCallManager {
	// Eslint is being a whiny bitch here, just ingore it the code works
	static totalCalls = 0;
	static curseforgeCalls = 0;
	static modrinthCalls = 0;

	static trackCall(callDestination) {
		this.totalCalls++;

		switch (callDestination) {
		case 'curseforge':
			this.curseforgeCalls++;
			break;
		case 'modrinth':
			this.modrinthCalls++;
			break;
		}
	}

	static logCalls() {
		logger.info(`ApiCallManager:\nTotal calls: ${this.totalCalls}\nCurseForge calls: ${this.curseforgeCalls}\nModrinth calls: ${this.modrinthCalls}`);

		this.totalCalls = 0;
		this.curseforgeCalls = 0;
		this.modrinthCalls = 0;
	}
}

module.exports = { ApiCallManager };