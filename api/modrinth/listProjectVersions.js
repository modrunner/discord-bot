const { request } = require('undici');
const logger = require('../../logger');
const { ApiCallManager } = require('../apiCallManager');

async function listProjectVersions(projectId) {
  for (let i = 3; i > 0; i--) {
    ApiCallManager.trackCall('modrinth');
    try {
      const responseData = await request(`https://api.modrinth.com/v2/project/${projectId}/version`, {
        method: 'GET',
        headers: {
          'user-agent': 'big7star/modrunner-bot/1.2.3 (modrunner.net)',
        },
      });
      return responseData;
    } catch (error) {
      logger.error(`A ${error.name} has occurred while requesting data from Modrinth (List Project Versions)`);
    }
  }
  return null;
}

module.exports = { listProjectVersions };
