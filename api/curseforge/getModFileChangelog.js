const { api_max_retries, cf_base_url } = require('../constants');
const { request } = require('undici');
const logger = require('../../logger');
const { ApiCallManager } = require('../apiCallManager');

async function getModFileChangelog(modId, fileId) {
	for (let i = api_max_retries; i > 0; i--) {
		ApiCallManager.trackCall('curseforge');
		try {
			return await request(`${cf_base_url}/mods/${modId}/files/${fileId}/changelog`, {
				method: 'GET',
				headers: {
					'x-api-key': process.env['CF_API_KEY'],
				},
			});
		} catch (error) {
			logger.debug(`A ${error.name} occurred while requesting data from CurseForge (Get Mod File Changelog)`);
		}
	}
	return null;
}

module.exports = { getModFileChangelog };