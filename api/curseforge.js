const { request } = require('undici');
const logger = require('../logger');

const config = {
  baseUrl: `https://api.curseforge.com`,
  apiKey: process.env.CURSEFORGE_API_KEY,
  maxRetries: 3,
  version: '1',
};

module.exports = {
  async getMod(modId) {
    for (let i = config.maxRetries; i > 0; i--) {
      try {
        return await request(`${config.baseUrl}/v${config.version}/mods/${modId}`, {
          method: 'GET',
          headers: {
            'x-api-key': config.apiKey,
          },
        });
      } catch (error) {
        logger.info(`An ${error.name} has occurred while requesting data from CurseForge (Get Mod)`);
      }
    }
    return null;
  },

  async getModFileChangelog(modId, fileId) {
    for (let i = config.maxRetries; i > 0; i--) {
      try {
        return await request(`${config.baseUrl}/v${config.version}/mods/${modId}/files/${fileId}/changelog`, {
          method: 'GET',
          headers: {
            'x-api-key': config.apiKey,
          },
        });
      } catch (error) {
        logger.debug(`A ${error.name} occurred while requesting data from CurseForge (Get Mod File Changelog)`);
      }
    }
    return null;
  },

  async getModFileDownloadUrl(modId, fileId) {
    for (let i = config.maxRetries; i > 0; i--) {
      try {
        return await request(`${config.baseUrl}/v${config.version}/mods/${modId}/files/${fileId}/download-url`, {
          method: 'GET',
          headers: {
            'x-api-key': config.apiKey,
          },
        });
      } catch (error) {
        logger.debug(`A ${error.name} occurred while requesting data from CurseForge (Get Mod File Download URL)`);
      }
    }
    return null;
  },

  async getMods(modIds) {
    for (let i = config.maxRetries; i > 0; i--) {
      try {
        return await request(`${config.baseUrl}/v${config.version}/mods`, {
          body: JSON.stringify({ modIds: modIds }),
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-api-key': config.apiKey,
          },
        });
      } catch (error) {
        logger.debug(`A ${error.name} occurred while requesting data from CurseForge (Get Mods)`);
      }
    }
    return null;
  },

  async searchMods(query) {
    for (let i = config.maxRetries; i > 0; i--) {
      try {
        return await request(`${config.baseUrl}/v${config.version}/mods/search?gameId=432&searchFilter=${new URLSearchParams({ query })}`, {
          method: 'GET',
          headers: {
            'x-api-key': config.apiKey,
          },
        });
      } catch (error) {
        logger.debug(`A ${error.name} occurred while requesting data from CurseForge (Search Mods)`);
      }
    }
    return null;
  },
};
