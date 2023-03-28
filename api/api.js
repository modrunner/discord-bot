const package = require('../package.json');
const { request } = require('undici');
const logger = require('../logger');

function capitalize(string) {
  return string.replace(string.charAt(0), String.fromCharCode(string.charCodeAt(0) - 32));
}

const api = {
  _globalConfig: {
    maxRetries: 3,
    userAgent: `${capitalize(package.name)}/${package.version} (modrunner.net)`,
  },
  curseforge: {
    _config: {
      baseUrl: 'https://api.curseforge.com',
      version: '1',
    },
  },
  ftb: {
    _config: {
      baseUrl: 'https://api.modpacks.ch',
    },
  },
  modrinth: {
    _config: {
      baseUrl: 'https://api.modrinth.com',
      version: '2',
    },
  },
};

module.exports = { api };
