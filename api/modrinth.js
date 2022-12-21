const { request } = require('undici');
const logger = require('../logger');
const package = require('../package.json');

const config = {
  baseUrl: `https://api.modrinth.com`,
  maxRetries: 3,
  userAgent: `${capitalize(package.name)}/${package.version} (modrunner.net)`,
  version: '2',
};

function capitalize(string) {
  return string.replace(string.charAt(0), String.fromCharCode(string.charCodeAt(0) - 32));
}

module.exports = {
  async getProject(projectId) {
    for (let i = config.maxRetries; i > 0; i--) {
      try {
        return await request(`${config.baseUrl}/v${config.version}/project/${projectId}`, {
          method: 'GET',
          headers: {
            'user-agent': config.userAgent,
          },
        });
      } catch (error) {
        logger.error(`A ${error.name} has occurred while requesting data from Modrinth (Get Project)`);
      }
    }
    return null;
  },

  async getProjects(projectIds) {
    for (let i = config.maxRetries; i > 0; i--) {
      try {
        const formattedIds = projectIds.map((id) => '"' + id + '"');
        return await request(`${config.baseUrl}/v${config.version}/projects?ids=[${formattedIds}]`, {
          method: 'GET',
          headers: {
            'user-agent': config.userAgent,
          },
        });
      } catch (error) {
        logger.error(`A ${error.name} has occurred while requesting data from Modrinth (Get Projects)`);
      }
    }
    return null;
  },

  async listProjectVersions(projectId) {
    for (let i = config.maxRetries; i > 0; i--) {
      try {
        return await request(`${config.baseUrl}/v${config.version}/project/${projectId}/version`, {
          method: 'GET',
          headers: {
            'user-agent': config.userAgent,
          },
        });
      } catch (error) {
        logger.error(`A ${error.name} has occurred while requesting data from Modrinth (List Project Versions)`);
      }
    }
    return null;
  },

  async searchProjects(query) {
    for (let i = config.maxRetries; i > 0; i--) {
      try {
        return await request(`${config.baseUrl}/v${config.version}/search?${new URLSearchParams({ query })}`, {
          method: 'GET',
          headers: {
            'User-Agent': config.userAgent,
          },
        });
      } catch (error) {
        logger.error(`A ${error.name} has occurred while requesting data from Modrinth (Search Projects)`);
      }
    }
    return null;
  },

  async validateIdOrSlug(idOrSlug) {
    for (let i = config.maxRetries; i > 0; i--) {
      try {
        return await request(`${config.baseUrl}/v${config.version}/project/${idOrSlug}/check`, {
          method: 'GET',
          headers: {
            'User-Agent': config.userAgent,
          },
        });
      } catch (error) {
        logger.error(`A ${error.name} has occurred while requesting data from Modrinth (Validate ID or Slug)`);
      }
    }
    return null;
  },
};
