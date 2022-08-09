const { api_max_retries, cf_api_key, cf_base_url } = require('../api_config.json');
const { request } = require('undici');
const logger = require('../../logger');
const { ApiCallManager } = require('../apiCallManager');

async function getMods(modIds) {
	for (let i = api_max_retries; i > 0; i--) {
		ApiCallManager.trackCall('curseforge');
		try {
			const responseData = await request(`${ cf_base_url }/mods`, {
				body: JSON.stringify({ 'modIds': modIds }),
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					'x-api-key': cf_api_key,
				},
			});
			return responseData;
		} catch (error) {
			logger.debug(`A ${error.name} occured while requesting data from CurseForge (Get Mods)`);
		}
	}
	return null;
}

module.exports = { getMods };