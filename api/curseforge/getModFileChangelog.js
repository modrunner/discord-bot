const { api_max_retries, cf_base_url, cf_api_key } = require('../api_config.json');
const { request } = require('undici');
const logger = require('../../logger');
const { ApiCallManager } = require('../apiCallManager');

async function getModFileChangelog(modId, fileId) {
	for (let i = api_max_retries; i > 0; i--) {
		ApiCallManager.trackCall('curseforge');
		try {
			const responseData = await request(`${cf_base_url}/mods/${modId}/files/${fileId}/changelog`, {
				method: 'GET',
				headers: {
					'x-api-key': cf_api_key,
				},
			});
			return responseData;
		} catch (error) {
			logger.debug(`A ${error.name} occured while requesting data from CurseForge (Get Mod File Changelog)`);
		}
	}
	return null;
}

module.exports = { getModFileChangelog };