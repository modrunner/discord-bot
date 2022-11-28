const { request } = require('undici');
const logger = require('../../logger');
const { ApiCallManager } = require('../apiCallManager');

async function searchProjects(query) {
  for (let i = 3; i > 0; i--) {
    ApiCallManager.trackCall('modrinth');
    try {
      const responseData = await request(`https://api.modrinth.com/v2/search?${new URLSearchParams({ query })}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'big7star/modrunner-bot/1.2.3 (modrunner.net)',
        },
      });
      return responseData;
    } catch (error) {
      logger.error(`A ${error.name} has occurred while requesting data from Modrinth (Search Projects)`);
    }
  }
  return null;
}

module.exports = { searchProjects };
