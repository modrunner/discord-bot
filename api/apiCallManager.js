const logger = require('../logger');

class ApiCallManager {
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
    logger.info(
      `API call monitoring: ${this.totalCalls} total calls, ${this.curseforgeCalls} CurseForge calls and ${this.modrinthCalls} Modrinth calls have been made in the last 24 hours.`
    );

    this.totalCalls = 0;
    this.curseforgeCalls = 0;
    this.modrinthCalls = 0;
  }
}

module.exports = { ApiCallManager };
