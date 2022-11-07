const { VERSION } = require('../version');

module.exports = {
  api_max_retries: 3,
  cf_base_url: 'https://api.curseforge.com/v1',
  modrinth_base_url: 'https://api.modrinth.com/v2',
  user_agent: `big7star/modrunner-bot/${VERSION} (modrunner.net)`,
};