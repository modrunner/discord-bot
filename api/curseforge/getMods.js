const { api_max_retries, cf_base_url } = require('../constants');
const { request } = require('undici');
const logger = require('../../logger');
const { ApiCallManager } = require('../apiCallManager');

async function getMods(modIds) {
	for (let i = api_max_retries; i > 0; i--) {
		ApiCallManager.trackCall('curseforge');
		try {
			return await request(`${cf_base_url}/mods`, {
				body: JSON.stringify({ 'modIds': modIds }),
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					'x-api-key': process.env['CF_API_KEY'],
				},
			});
		} catch (error) {
			logger.debug(`A ${error.name} occurred while requesting data from CurseForge (Get Mods)`);
		}
	}
	return null;
}

module.exports = { getMods };